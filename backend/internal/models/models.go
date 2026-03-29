package models

import "time"

type Client struct {
	ID        string     `json:"id"`
	Name      string     `json:"name"`
	Phone     string     `json:"phone"`
	Address   string     `json:"address"`
	Latitude  *float64   `json:"latitude,omitempty"`
	Longitude *float64   `json:"longitude,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

type Employee struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

type JobStatus string

const (
	JobPending    JobStatus = "pending"
	JobAssigned   JobStatus = "assigned"
	JobInProgress JobStatus = "in_progress"
	JobDone       JobStatus = "done"
	JobCancelled  JobStatus = "cancelled"
)

type Job struct {
	ID                 string    `json:"id"`
	ClientID           string    `json:"client_id"`
	AssignedEmployeeID *string   `json:"assigned_employee_id,omitempty"`
	ServiceType        string    `json:"service_type"`
	ScheduledAt        time.Time `json:"scheduled_at"`
	Status             JobStatus `json:"status"`
	Notes              string    `json:"notes,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
}
