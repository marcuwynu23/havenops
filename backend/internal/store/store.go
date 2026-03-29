package store

import "havenops/internal/models"

type Store interface {
	CreateClient(c *models.Client) error
	ListClients() ([]models.Client, error)
	GetClient(id string) (*models.Client, error)
	UpdateClient(c *models.Client) error
	ListClientsForEmployeeJobs(employeeID string) ([]models.Client, error)

	CreateEmployee(e *models.Employee) error
	ListEmployees() ([]models.Employee, error)
	SetEmployeeActive(id string, active bool) error

	CreateUser(u *models.User) error
	GetUserByID(id string) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
	UpdateUserPassword(userID, passwordHash string) error

	CreateRecoveryToken(userID string) (token string, err error)
	ConsumeRecoveryToken(token string) (userID string, err error)

	CreateJob(j *models.Job) error
	// ListJobs filters: non-empty employeeID limits to that assignee; non-empty clientID limits to that client; both empty returns all.
	ListJobs(employeeID, clientID string) ([]models.Job, error)
	GetJob(id string) (*models.Job, error)
	UpdateJobStatus(id string, status models.JobStatus) error
	AssignJob(id string, employeeID *string) error

	// For assignment: active employees and per-employee active job counts.
	ActiveEmployees() ([]models.Employee, error)
	CountActiveJobsByEmployee() (map[string]int, error)
}
