package assignment

import (
	"time"

	"havenops/internal/models"
	"havenops/internal/store"
)

// DefaultSlotDuration is the assumed on-site block used for load balancing and conflict detection.
const DefaultSlotDuration = 2 * time.Hour

// SlotPadding is travel / buffer time between adjacent bookings for the same employee.
const SlotPadding = 15 * time.Minute

func jobTerminal(s models.JobStatus) bool {
	return s == models.JobDone || s == models.JobCancelled
}

func slotWindow(start time.Time) (from, to time.Time) {
	from = start.UTC()
	to = from.Add(DefaultSlotDuration)
	return from, to
}

// paddedOverlap returns true if the two [start,end) job blocks conflict after padding.
func paddedOverlap(a0, a1, b0, b1 time.Time) bool {
	a0 = a0.Add(-SlotPadding)
	a1 = a1.Add(SlotPadding)
	b0 = b0.Add(-SlotPadding)
	b1 = b1.Add(SlotPadding)
	return a0.Before(b1) && b0.Before(a1)
}

func employeeFreeForSlot(s store.Store, empID string, slotStart, slotEnd time.Time) (bool, error) {
	jobs, err := s.ListJobs(empID, "")
	if err != nil {
		return false, err
	}
	for _, j := range jobs {
		if jobTerminal(j.Status) {
			continue
		}
		js, je := slotWindow(j.ScheduledAt)
		if paddedOverlap(slotStart, slotEnd, js, je) {
			return false, nil
		}
	}
	return true, nil
}

// PickAssigneeForSlot picks an active employee who has no time conflict with scheduledAt
// (non-terminal jobs use [scheduledAt, scheduledAt+DefaultSlotDuration] plus SlotPadding).
// Among those, chooses the employee with the fewest active (non-terminal) assigned jobs;
// ties break on lexicographically smaller employee ID.
// If every active employee is busy in that window, returns ok=false so the job stays pending (queue).
func PickAssigneeForSlot(s store.Store, scheduledAt time.Time) (string, bool, error) {
	emps, err := s.ActiveEmployees()
	if err != nil || len(emps) == 0 {
		return "", false, err
	}
	counts, err := s.CountActiveJobsByEmployee()
	if err != nil {
		return "", false, err
	}
	slotStart, slotEnd := slotWindow(scheduledAt)

	var free []models.Employee
	for _, e := range emps {
		ok, err := employeeFreeForSlot(s, e.ID, slotStart, slotEnd)
		if err != nil {
			return "", false, err
		}
		if ok {
			free = append(free, e)
		}
	}
	if len(free) == 0 {
		return "", false, nil
	}

	var best string
	bestCount := -1
	for _, e := range free {
		c := counts[e.ID]
		if bestCount < 0 || c < bestCount || (c == bestCount && e.ID < best) {
			best = e.ID
			bestCount = c
		}
	}
	return best, true, nil
}

// ApplyToJob assigns the job if an employee is available for its scheduled time; otherwise leaves it pending (queued).
func ApplyToJob(s store.Store, jobID string) error {
	j, err := s.GetJob(jobID)
	if err != nil {
		return err
	}
	empID, ok, err := PickAssigneeForSlot(s, j.ScheduledAt)
	if err != nil || !ok {
		return err
	}
	return s.AssignJob(jobID, &empID)
}
