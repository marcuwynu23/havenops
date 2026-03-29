package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"havenops/internal/auth"
	"havenops/internal/models"
	"havenops/internal/store"
)

func TestPostJob_AutoAssignsFreeAtSlot(t *testing.T) {
	st := store.NewMemory()
	now := time.Now().UTC()
	hash, err := auth.HashPassword("clientpass")
	if err != nil {
		t.Fatal(err)
	}
	cid := "c1"
	clientU := &models.User{
		ID:           "cli",
		Email:        "client@test.com",
		PasswordHash: hash,
		Role:         models.RoleClient,
		ClientID:     &cid,
		CreatedAt:    now,
	}
	if err := st.CreateUser(clientU); err != nil {
		t.Fatal(err)
	}
	_ = st.CreateClient(&models.Client{ID: "c1", Name: "Client", CreatedAt: now})
	_ = st.CreateEmployee(&models.Employee{ID: "e1", Name: "Busy", IsActive: true, CreatedAt: now})
	_ = st.CreateEmployee(&models.Employee{ID: "e2", Name: "Free", IsActive: true, CreatedAt: now})

	emp1 := "e1"
	_ = st.CreateJob(&models.Job{
		ID:                 "existing",
		ClientID:           "c1",
		AssignedEmployeeID: &emp1,
		ServiceType:        "clean",
		ScheduledAt:        now,
		Status:             models.JobInProgress,
		CreatedAt:          now,
	})

	token, err := auth.SignAccessToken("test-secret", clientU, time.Hour)
	if err != nil {
		t.Fatal(err)
	}

	api := &API{Store: st, JWTSecret: "test-secret"}
	srv := httptest.NewServer(api.Routes())
	defer srv.Close()

	// e1 is busy around `now`; new job at now+1h overlaps e1's 2h slot → assign e2.
	body := map[string]string{
		"service_type": "deep clean",
		"scheduled_at": now.Add(time.Hour).Format(time.RFC3339),
	}
	b, _ := json.Marshal(body)
	req, err := http.NewRequest(http.MethodPost, srv.URL+"/jobs", bytes.NewReader(b))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusCreated {
		t.Fatalf("status %d", res.StatusCode)
	}
	var job models.Job
	_ = json.NewDecoder(res.Body).Decode(&job)
	if job.AssignedEmployeeID == nil || *job.AssignedEmployeeID != "e2" {
		t.Fatalf("expected assignment to e2, got %#v", job.AssignedEmployeeID)
	}
	if job.Status != models.JobAssigned {
		t.Fatalf("expected assigned, got %s", job.Status)
	}
}

func TestPatchClientMe_UpdatesAddressAndCoords(t *testing.T) {
	st := store.NewMemory()
	now := time.Now().UTC()
	hash, err := auth.HashPassword("clientpass")
	if err != nil {
		t.Fatal(err)
	}
	cid := "c1"
	if err := st.CreateClient(&models.Client{ID: cid, Name: "C", Address: "Old st", CreatedAt: now}); err != nil {
		t.Fatal(err)
	}
	clientU := &models.User{
		ID:           "cli",
		Email:        "client@test.com",
		PasswordHash: hash,
		Role:         models.RoleClient,
		ClientID:     &cid,
		CreatedAt:    now,
	}
	if err := st.CreateUser(clientU); err != nil {
		t.Fatal(err)
	}
	token, err := auth.SignAccessToken("test-secret", clientU, time.Hour)
	if err != nil {
		t.Fatal(err)
	}
	api := &API{Store: st, JWTSecret: "test-secret"}
	srv := httptest.NewServer(api.Routes())
	defer srv.Close()

	lat, lon := 40.7128, -74.0060
	body := map[string]any{
		"address":   "New st",
		"latitude":  lat,
		"longitude": lon,
	}
	b, _ := json.Marshal(body)
	req, err := http.NewRequest(http.MethodPatch, srv.URL+"/clients/me", bytes.NewReader(b))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("status %d", res.StatusCode)
	}
	var out models.Client
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		t.Fatal(err)
	}
	if out.Address != "New st" {
		t.Fatalf("address %q", out.Address)
	}
	if out.Latitude == nil || out.Longitude == nil || *out.Latitude != lat || *out.Longitude != lon {
		t.Fatalf("coords %#v %#v", out.Latitude, out.Longitude)
	}
}

func TestPatchClientMe_AdminForbidden(t *testing.T) {
	st := store.NewMemory()
	now := time.Now().UTC()
	hash, _ := auth.HashPassword("adminpass")
	adminU := &models.User{
		ID:           "adm",
		Email:        "admin@test.com",
		PasswordHash: hash,
		Role:         models.RoleAdmin,
		CreatedAt:    now,
	}
	_ = st.CreateUser(adminU)
	token, _ := auth.SignAccessToken("sec", adminU, time.Hour)
	api := &API{Store: st, JWTSecret: "sec"}
	srv := httptest.NewServer(api.Routes())
	defer srv.Close()
	body := map[string]any{"address": "x"}
	b, _ := json.Marshal(body)
	req, _ := http.NewRequest(http.MethodPatch, srv.URL+"/clients/me", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusForbidden {
		t.Fatalf("expected 403, got %d", res.StatusCode)
	}
}
