package assignment

import (
	"testing"
	"time"

	"havenops/internal/models"
	"havenops/internal/store"
)

func TestPickAssigneeForSlot_LeastLoadedAmongAvailable(t *testing.T) {
	s := store.NewMemory()
	now := time.Now().UTC()

	e1 := &models.Employee{ID: "a", Name: "Alice", IsActive: true, CreatedAt: now}
	e2 := &models.Employee{ID: "b", Name: "Bob", IsActive: true, CreatedAt: now}
	_ = s.CreateEmployee(e1)
	_ = s.CreateEmployee(e2)

	c := &models.Client{ID: "c1", Name: "C", CreatedAt: now}
	_ = s.CreateClient(c)

	// Slot far in the future so these historical jobs do not overlap the chosen time.
	slot := now.Add(365 * 24 * time.Hour)

	mkJob := func(id, emp string) {
		empCopy := emp
		j := &models.Job{
			ID:                 id,
			ClientID:           "c1",
			AssignedEmployeeID: &empCopy,
			ServiceType:        "clean",
			ScheduledAt:        now,
			Status:             models.JobAssigned,
			CreatedAt:          now,
		}
		_ = s.CreateJob(j)
	}
	mkJob("j1", "a")
	mkJob("j2", "a")

	id, ok, err := PickAssigneeForSlot(s, slot)
	if err != nil || !ok || id != "b" {
		t.Fatalf("expected employee b, ok=true, got id=%q ok=%v err=%v", id, ok, err)
	}
}

func TestPickAssigneeForSlot_NoActiveEmployees(t *testing.T) {
	s := store.NewMemory()
	now := time.Now().UTC()
	_ = s.CreateEmployee(&models.Employee{ID: "x", Name: "X", IsActive: false, CreatedAt: now})
	_, ok, err := PickAssigneeForSlot(s, now)
	if err != nil || ok {
		t.Fatalf("expected ok=false, err=nil, got ok=%v err=%v", ok, err)
	}
}

func TestPickAssigneeForSlot_IgnoresTerminalJobsForLoadAndConflicts(t *testing.T) {
	s := store.NewMemory()
	now := time.Now().UTC()
	_ = s.CreateEmployee(&models.Employee{ID: "a", Name: "A", IsActive: true, CreatedAt: now})
	_ = s.CreateEmployee(&models.Employee{ID: "b", Name: "B", IsActive: true, CreatedAt: now})
	_ = s.CreateClient(&models.Client{ID: "c1", Name: "C", CreatedAt: now})

	empA := "a"
	done := &models.Job{
		ID:                 "j1",
		ClientID:           "c1",
		AssignedEmployeeID: &empA,
		ServiceType:        "clean",
		ScheduledAt:        now,
		Status:             models.JobDone,
		CreatedAt:          now,
	}
	_ = s.CreateJob(done)
	activeA := &models.Job{
		ID:                 "j2",
		ClientID:           "c1",
		AssignedEmployeeID: &empA,
		ServiceType:        "clean",
		ScheduledAt:        now,
		Status:             models.JobAssigned,
		CreatedAt:          now,
	}
	_ = s.CreateJob(activeA)

	// Same instant as A's active job → A is busy, B is free.
	id, ok, err := PickAssigneeForSlot(s, now)
	if err != nil || !ok || id != "b" {
		t.Fatalf("expected b (a busy at this slot), got %q ok=%v err=%v", id, ok, err)
	}
}

func TestPickAssigneeForSlot_QueuesWhenAllBusy(t *testing.T) {
	s := store.NewMemory()
	day := time.Date(2026, 6, 15, 10, 0, 0, 0, time.UTC)

	e1 := &models.Employee{ID: "e1", Name: "One", IsActive: true, CreatedAt: day}
	e2 := &models.Employee{ID: "e2", Name: "Two", IsActive: true, CreatedAt: day}
	_ = s.CreateEmployee(e1)
	_ = s.CreateEmployee(e2)
	_ = s.CreateClient(&models.Client{ID: "c1", Name: "C", CreatedAt: day})

	emp1 := "e1"
	emp2 := "e2"
	_ = s.CreateJob(&models.Job{
		ID:                 "j1",
		ClientID:           "c1",
		AssignedEmployeeID: &emp1,
		ServiceType:        "clean",
		ScheduledAt:        day,
		Status:             models.JobAssigned,
		CreatedAt:          day,
	})
	_ = s.CreateJob(&models.Job{
		ID:                 "j2",
		ClientID:           "c1",
		AssignedEmployeeID: &emp2,
		ServiceType:        "clean",
		ScheduledAt:        day.Add(30 * time.Minute),
		Status:             models.JobInProgress,
		CreatedAt:          day,
	})

	// 11:00 start overlaps both padded windows (10:00–12:00 and 10:30–12:30).
	conflictTime := day.Add(time.Hour)
	_, ok, err := PickAssigneeForSlot(s, conflictTime)
	if err != nil || ok {
		t.Fatalf("expected queued (ok=false), got ok=%v err=%v", ok, err)
	}
}
