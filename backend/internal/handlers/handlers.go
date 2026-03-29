package handlers

import (
	"encoding/json"
	"errors"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"havenops/internal/assignment"
	"havenops/internal/auth"
	"havenops/internal/models"
	"havenops/internal/store"
)

type API struct {
	Store               store.Store
	JWTSecret           string
	JWTExpiry           time.Duration
	ExposeRecoveryToken bool
}

func (a *API) Routes() chi.Router {
	r := chi.NewRouter()
	r.Route("/auth", func(ar chi.Router) {
		ar.Post("/register", a.postRegister)
		ar.Post("/login", a.postLogin)
		ar.Post("/recovery/request", a.postRecoveryRequest)
		ar.Post("/recovery/reset", a.postRecoveryReset)
	})
	r.Group(func(pr chi.Router) {
		pr.Use(a.authenticate)
		pr.Get("/auth/me", a.getMe)
		pr.Post("/clients", a.postClient)
		pr.Get("/clients", a.getClients)
		pr.Patch("/clients/me", a.patchClientMe)
		pr.Get("/geocode/forward", a.getGeocodeForward)
		pr.Get("/geocode/reverse", a.getGeocodeReverse)
		pr.Post("/employees", a.postEmployee)
		pr.Get("/employees", a.getEmployees)
		pr.Patch("/employees/{id}", a.patchEmployee)
		pr.Post("/jobs", a.postJob)
		pr.Get("/jobs", a.getJobs)
		pr.Patch("/jobs/{id}/status", a.patchJobStatus)
		pr.Patch("/jobs/{id}/assign", a.patchJobAssign)
	})
	return r
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func readJSON(r *http.Request, dst any) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	return dec.Decode(dst)
}

func requireAdmin(w http.ResponseWriter, u *models.User) bool {
	if u == nil || u.Role != models.RoleAdmin {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "admin only"})
		return false
	}
	return true
}

func (a *API) postClient(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusForbidden, map[string]string{
		"error": "clients are created through self-service registration",
	})
}

func (a *API) getClients(w http.ResponseWriter, r *http.Request) {
	u := userFromCtx(r.Context())
	if u == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	var list []models.Client
	var err error
	switch u.Role {
	case models.RoleAdmin:
		list, err = a.Store.ListClients()
	case models.RoleClient:
		if u.ClientID == nil {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
			return
		}
		c, gerr := a.Store.GetClient(*u.ClientID)
		if gerr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": gerr.Error()})
			return
		}
		list = []models.Client{*c}
	case models.RoleEmployee:
		if u.EmployeeID == nil {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
			return
		}
		list, err = a.Store.ListClientsForEmployeeJobs(*u.EmployeeID)
	default:
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if list == nil {
		list = []models.Client{}
	}
	writeJSON(w, http.StatusOK, list)
}

type patchClientMeBody struct {
	Address          *string  `json:"address"`
	Latitude         *float64 `json:"latitude"`
	Longitude        *float64 `json:"longitude"`
	ClearCoordinates *bool    `json:"clear_coordinates"`
}

func validWGS84(lat, lon float64) bool {
	if math.IsNaN(lat) || math.IsNaN(lon) || math.IsInf(lat, 0) || math.IsInf(lon, 0) {
		return false
	}
	return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

func (a *API) patchClientMe(w http.ResponseWriter, r *http.Request) {
	u := userFromCtx(r.Context())
	if u == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	if u.Role != models.RoleClient || u.ClientID == nil {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "clients only"})
		return
	}
	var body patchClientMeBody
	if err := readJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	changed := false
	c, err := a.Store.GetClient(*u.ClientID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if body.Address != nil {
		c.Address = strings.TrimSpace(*body.Address)
		changed = true
	}
	if body.ClearCoordinates != nil && *body.ClearCoordinates {
		c.Latitude, c.Longitude = nil, nil
		changed = true
	} else if body.Latitude != nil || body.Longitude != nil {
		if body.Latitude == nil || body.Longitude == nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "latitude and longitude must both be sent together",
			})
			return
		}
		if !validWGS84(*body.Latitude, *body.Longitude) {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid coordinates"})
			return
		}
		lat, lon := *body.Latitude, *body.Longitude
		c.Latitude = &lat
		c.Longitude = &lon
		changed = true
	}
	if !changed {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "no updates"})
		return
	}
	if err := a.Store.UpdateClient(c); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, c)
}

type postEmployeeBody struct {
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Password string `json:"password"`
	IsActive *bool  `json:"is_active"`
}

func (a *API) postEmployee(w http.ResponseWriter, r *http.Request) {
	u := userFromCtx(r.Context())
	if !requireAdmin(w, u) {
		return
	}
	var body postEmployeeBody
	if err := readJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	if body.Name == "" || body.Email == "" || body.Password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name, email, and password required"})
		return
	}
	if len(body.Password) < minPasswordLen {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "password must be at least 8 characters"})
		return
	}
	hash, err := auth.HashPassword(body.Password)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not hash password"})
		return
	}
	active := true
	if body.IsActive != nil {
		active = *body.IsActive
	}
	now := time.Now().UTC()
	e := &models.Employee{
		ID:        uuid.NewString(),
		Name:      body.Name,
		Phone:     body.Phone,
		IsActive:  active,
		CreatedAt: now,
	}
	if err := a.Store.CreateEmployee(e); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	eid := e.ID
	usr := &models.User{
		ID:           uuid.NewString(),
		Email:        body.Email,
		PasswordHash: hash,
		Role:         models.RoleEmployee,
		EmployeeID:   &eid,
		CreatedAt:    now,
	}
	if err := a.Store.CreateUser(usr); err != nil {
		if errors.Is(err, store.ErrEmailTaken) {
			writeJSON(w, http.StatusConflict, map[string]string{"error": "email already registered"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, e)
}

func (a *API) getEmployees(w http.ResponseWriter, r *http.Request) {
	u := userFromCtx(r.Context())
	if !requireAdmin(w, u) {
		return
	}
	list, err := a.Store.ListEmployees()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if list == nil {
		list = []models.Employee{}
	}
	writeJSON(w, http.StatusOK, list)
}

type patchEmployeeBody struct {
	IsActive bool `json:"is_active"`
}

func (a *API) patchEmployee(w http.ResponseWriter, r *http.Request) {
	u := userFromCtx(r.Context())
	if !requireAdmin(w, u) {
		return
	}
	id := chi.URLParam(r, "id")
	var body patchEmployeeBody
	if err := readJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	if err := a.Store.SetEmployeeActive(id, body.IsActive); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	list, _ := a.Store.ListEmployees()
	for _, e := range list {
		if e.ID == id {
			writeJSON(w, http.StatusOK, e)
			return
		}
	}
	writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
}

type postJobBody struct {
	ClientID    string `json:"client_id"`
	ServiceType string `json:"service_type"`
	ScheduledAt string `json:"scheduled_at"`
	Notes       string `json:"notes"`
}

func (a *API) postJob(w http.ResponseWriter, r *http.Request) {
	u := userFromCtx(r.Context())
	if u == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	if u.Role == models.RoleEmployee {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "employees cannot create jobs"})
		return
	}
	if u.Role != models.RoleClient {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "job booking is only available to client accounts"})
		return
	}
	var body postJobBody
	if err := readJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	if u.Role == models.RoleClient {
		if u.ClientID == nil {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "invalid account"})
			return
		}
		body.ClientID = *u.ClientID
	}
	if body.ClientID == "" || body.ServiceType == "" || body.ScheduledAt == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "client_id, service_type, scheduled_at required"})
		return
	}
	t, err := time.Parse(time.RFC3339, body.ScheduledAt)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "scheduled_at must be RFC3339"})
		return
	}
	now := time.Now().UTC()
	j := &models.Job{
		ID:          uuid.NewString(),
		ClientID:    body.ClientID,
		ServiceType: body.ServiceType,
		ScheduledAt: t.UTC(),
		Status:      models.JobPending,
		Notes:       body.Notes,
		CreatedAt:   now,
	}
	if err := a.Store.CreateJob(j); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "client not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if err := assignment.ApplyToJob(a.Store, j.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	updated, err := a.Store.GetJob(j.ID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, updated)
}

func (a *API) getJobs(w http.ResponseWriter, r *http.Request) {
	u := userFromCtx(r.Context())
	if u == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	var list []models.Job
	var err error
	switch u.Role {
	case models.RoleAdmin:
		list, err = a.Store.ListJobs(r.URL.Query().Get("employee_id"), r.URL.Query().Get("client_id"))
	case models.RoleEmployee:
		if u.EmployeeID == nil {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "invalid employee account"})
			return
		}
		list, err = a.Store.ListJobs(*u.EmployeeID, "")
	case models.RoleClient:
		if u.ClientID == nil {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "invalid client account"})
			return
		}
		list, err = a.Store.ListJobs("", *u.ClientID)
	default:
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if list == nil {
		list = []models.Job{}
	}
	writeJSON(w, http.StatusOK, list)
}

type patchJobStatusBody struct {
	Status models.JobStatus `json:"status"`
}

func (a *API) patchJobStatus(w http.ResponseWriter, r *http.Request) {
	u := userFromCtx(r.Context())
	if u == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	id := chi.URLParam(r, "id")
	var body patchJobStatusBody
	if err := readJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	if !validStatus(body.Status) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid status"})
		return
	}
	if u.Role == models.RoleClient {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "clients cannot change job status"})
		return
	}
	if u.Role == models.RoleEmployee {
		job, err := a.Store.GetJob(id)
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		if u.EmployeeID == nil || job.AssignedEmployeeID == nil || *job.AssignedEmployeeID != *u.EmployeeID {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "not assigned to this job"})
			return
		}
	}
	err := a.Store.UpdateJobStatus(id, body.Status)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		if errors.Is(err, store.ErrInvalidStatus) {
			writeJSON(w, http.StatusConflict, map[string]string{"error": "invalid status transition"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	j, err := a.Store.GetJob(id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, j)
}

func validStatus(s models.JobStatus) bool {
	switch s {
	case models.JobPending, models.JobAssigned, models.JobInProgress, models.JobDone, models.JobCancelled:
		return true
	default:
		return false
	}
}

type patchJobAssignBody struct {
	EmployeeID *string `json:"employee_id"`
}

func (a *API) patchJobAssign(w http.ResponseWriter, r *http.Request) {
	u := userFromCtx(r.Context())
	if !requireAdmin(w, u) {
		return
	}
	id := chi.URLParam(r, "id")
	var body patchJobAssignBody
	if err := readJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	if body.EmployeeID != nil && *body.EmployeeID == "" {
		body.EmployeeID = nil
	}
	if err := a.Store.AssignJob(id, body.EmployeeID); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	j, err := a.Store.GetJob(id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, j)
}
