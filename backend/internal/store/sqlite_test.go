package store

import (
	"path/filepath"
	"testing"
	"time"

	"github.com/google/uuid"

	"havenops/internal/models"
)

func TestSQLite_CreateUserDuplicateEmail(t *testing.T) {
	s, err := OpenSQLite(filepath.Join(t.TempDir(), "t.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()

	now := time.Now().UTC()
	u1 := &models.User{
		ID:           uuid.NewString(),
		Email:        "Same@Example.com",
		PasswordHash: "h1",
		Role:         models.RoleAdmin,
		CreatedAt:    now,
	}
	if err := s.CreateUser(u1); err != nil {
		t.Fatal(err)
	}
	u2 := &models.User{
		ID:           uuid.NewString(),
		Email:        "same@example.com",
		PasswordHash: "h2",
		Role:         models.RoleAdmin,
		CreatedAt:    now,
	}
	if err := s.CreateUser(u2); err != ErrEmailTaken {
		t.Fatalf("want ErrEmailTaken, got %v", err)
	}
}

func TestSQLite_RecoveryTokenRoundTrip(t *testing.T) {
	s, err := OpenSQLite(filepath.Join(t.TempDir(), "t.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()

	now := time.Now().UTC()
	u := &models.User{
		ID:           uuid.NewString(),
		Email:        "u@x.test",
		PasswordHash: "h",
		Role:         models.RoleAdmin,
		CreatedAt:    now,
	}
	if err := s.CreateUser(u); err != nil {
		t.Fatal(err)
	}
	tok, err := s.CreateRecoveryToken(u.ID)
	if err != nil || tok == "" {
		t.Fatalf("CreateRecoveryToken: %v", err)
	}
	uid, err := s.ConsumeRecoveryToken(tok)
	if err != nil || uid != u.ID {
		t.Fatalf("ConsumeRecoveryToken: got %q, %v", uid, err)
	}
	if _, err := s.ConsumeRecoveryToken(tok); err != ErrInvalidRecovery {
		t.Fatalf("second consume: want ErrInvalidRecovery, got %v", err)
	}
}

func TestSQLite_AssignJobRules(t *testing.T) {
	s, err := OpenSQLite(filepath.Join(t.TempDir(), "t.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()

	now := time.Now().UTC()
	c := &models.Client{ID: uuid.NewString(), Name: "C", CreatedAt: now}
	if err := s.CreateClient(c); err != nil {
		t.Fatal(err)
	}
	active := &models.Employee{ID: uuid.NewString(), Name: "A", IsActive: true, CreatedAt: now}
	inactive := &models.Employee{ID: uuid.NewString(), Name: "I", IsActive: false, CreatedAt: now}
	for _, e := range []*models.Employee{active, inactive} {
		if err := s.CreateEmployee(e); err != nil {
			t.Fatal(err)
		}
	}
	j := &models.Job{
		ID:          uuid.NewString(),
		ClientID:    c.ID,
		ServiceType: "clean",
		ScheduledAt: now,
		Status:      models.JobPending,
		CreatedAt:   now,
	}
	if err := s.CreateJob(j); err != nil {
		t.Fatal(err)
	}
	if err := s.AssignJob(j.ID, &inactive.ID); err == nil || err.Error() != "employee inactive" {
		t.Fatalf("assign inactive: got %v", err)
	}
	eid := active.ID
	if err := s.AssignJob(j.ID, &eid); err != nil {
		t.Fatal(err)
	}
	got, _ := s.GetJob(j.ID)
	if got.Status != models.JobAssigned || got.AssignedEmployeeID == nil || *got.AssignedEmployeeID != active.ID {
		t.Fatalf("job after assign: %+v", got)
	}
	if err := s.UpdateJobStatus(j.ID, models.JobDone); err != nil {
		t.Fatal(err)
	}
	if err := s.AssignJob(j.ID, &eid); err == nil || err.Error() != "cannot reassign finished job" {
		t.Fatalf("reassign done: got %v", err)
	}
}
