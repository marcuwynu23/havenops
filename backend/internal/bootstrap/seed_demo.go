package bootstrap

import (
	"log"
	"time"

	"github.com/google/uuid"

	"havenops/internal/assignment"
	"havenops/internal/auth"
	"havenops/internal/models"
	"havenops/internal/store"
)

// DemoAccountPassword is the shared password for all demo users created by SeedDemo.
const DemoAccountPassword = "havenops123"

// sentinel email: if this user exists, SeedDemo is treated as already applied (idempotent for non-fresh stores).
const demoSeedMarkerEmail = "alex@demo.havenops.local"

// SeedDemo inserts sample clients, employees (with users), one client portal user, and jobs.
// Safe to call on an empty store. If a user with the demo marker email already exists, returns nil immediately.
// Use environment HAVENOPS_SEED_DEMO=1 from main; passwords are DemoAccountPassword (logged once).
func SeedDemo(s store.Store) error {
	if _, err := s.GetUserByEmail(demoSeedMarkerEmail); err == nil {
		return nil
	}
	hash, err := auth.HashPassword(DemoAccountPassword)
	if err != nil {
		return err
	}
	now := time.Now().UTC()

	c1 := &models.Client{
		ID:        uuid.NewString(),
		Name:      "Northside Medical Clinic",
		Phone:     "555-0100",
		Address:   "1200 Oak Ave, Springfield",
		CreatedAt: now.Add(-48 * time.Hour),
	}
	c2 := &models.Client{
		ID:        uuid.NewString(),
		Name:      "Harbor View Apartments",
		Phone:     "555-0200",
		Address:   "88 Pier Rd, Baytown",
		CreatedAt: now.Add(-36 * time.Hour),
	}
	c3 := &models.Client{
		ID:        uuid.NewString(),
		Name:      "Jordan Lee",
		Phone:     "555-0300",
		Address:   "42 Maple St",
		CreatedAt: now.Add(-24 * time.Hour),
	}
	for _, c := range []*models.Client{c1, c2, c3} {
		if err := s.CreateClient(c); err != nil {
			return err
		}
	}

	e1 := &models.Employee{
		ID:        uuid.NewString(),
		Name:      "Alex Morgan",
		Phone:     "555-1001",
		IsActive:  true,
		CreatedAt: now.Add(-72 * time.Hour),
	}
	e2 := &models.Employee{
		ID:        uuid.NewString(),
		Name:      "Sam Rivera",
		Phone:     "555-1002",
		IsActive:  true,
		CreatedAt: now.Add(-70 * time.Hour),
	}
	for _, e := range []*models.Employee{e1, e2} {
		if err := s.CreateEmployee(e); err != nil {
			return err
		}
		eid := e.ID
		email := demoSeedMarkerEmail
		if e.ID == e2.ID {
			email = "sam@demo.havenops.local"
		}
		u := &models.User{
			ID:           uuid.NewString(),
			Email:        email,
			PasswordHash: hash,
			Role:         models.RoleEmployee,
			EmployeeID:   &eid,
			CreatedAt:    now,
		}
		if err := s.CreateUser(u); err != nil {
			return err
		}
	}

	c3id := c3.ID
	clientUser := &models.User{
		ID:           uuid.NewString(),
		Email:        "client@demo.havenops.local",
		PasswordHash: hash,
		Role:         models.RoleClient,
		ClientID:     &c3id,
		CreatedAt:    now,
	}
	if err := s.CreateUser(clientUser); err != nil {
		return err
	}

	type jobSpec struct {
		clientID    string
		service     string
		scheduled   time.Time
		notes       string
		afterAssign func(jobID string) error
	}
	base := now.Truncate(time.Minute)
	specs := []jobSpec{
		{c1.ID, "Deep clean", base.Add(24 * time.Hour), "Focus on waiting rooms", nil},
		{c2.ID, "Standard turnover", base.Add(48 * time.Hour), "Unit 3B", nil},
		{c3.ID, "Maintenance clean", base.Add(72 * time.Hour), "", nil},
		{c1.ID, "Touch-up", base.Add(96 * time.Hour), "After event", nil},
		{c2.ID, "Move-out clean", base.Add(6 * time.Hour), "Priority", func(jobID string) error {
			if err := assignment.ApplyToJob(s, jobID); err != nil {
				return err
			}
			if err := s.UpdateJobStatus(jobID, models.JobInProgress); err != nil {
				return err
			}
			return nil
		}},
		{c3.ID, "Weekly service", base.Add(-2 * time.Hour), "Completed last visit", func(jobID string) error {
			if err := assignment.ApplyToJob(s, jobID); err != nil {
				return err
			}
			if err := s.UpdateJobStatus(jobID, models.JobDone); err != nil {
				return err
			}
			return nil
		}},
	}

	for _, sp := range specs {
		j := &models.Job{
			ID:          uuid.NewString(),
			ClientID:    sp.clientID,
			ServiceType: sp.service,
			ScheduledAt: sp.scheduled.UTC(),
			Status:      models.JobPending,
			Notes:       sp.notes,
			CreatedAt:   now,
		}
		if err := s.CreateJob(j); err != nil {
			return err
		}
		if sp.afterAssign != nil {
			if err := sp.afterAssign(j.ID); err != nil {
				return err
			}
			continue
		}
		if err := assignment.ApplyToJob(s, j.ID); err != nil {
			return err
		}
	}

	log.Println("demo seed: clients, employees, portal user, and jobs loaded")
	log.Printf("demo seed: password for all demo accounts is %q", DemoAccountPassword)
	log.Println("demo seed: alex@demo.havenops.local, sam@demo.havenops.local (employees); client@demo.havenops.local (portal)")
	return nil
}
