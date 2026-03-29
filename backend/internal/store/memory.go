package store

import (
	"errors"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"havenops/internal/models"
)

var (
	ErrNotFound      = errors.New("not found")
	ErrInvalidStatus = errors.New("invalid status transition")
)

type recoveryRecord struct {
	userID  string
	expires time.Time
}

type Memory struct {
	mu             sync.RWMutex
	clients        map[string]*models.Client
	employees      map[string]*models.Employee
	jobs           map[string]*models.Job
	users          map[string]*models.User
	usersByEmail   map[string]*models.User
	recoveryTokens map[string]recoveryRecord
}

func NewMemory() *Memory {
	return &Memory{
		clients:        make(map[string]*models.Client),
		employees:      make(map[string]*models.Employee),
		jobs:           make(map[string]*models.Job),
		users:          make(map[string]*models.User),
		usersByEmail:   make(map[string]*models.User),
		recoveryTokens: make(map[string]recoveryRecord),
	}
}

func normEmail(e string) string {
	return strings.ToLower(strings.TrimSpace(e))
}

func (m *Memory) CreateUser(u *models.User) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	u.Email = normEmail(u.Email)
	key := u.Email
	if _, ok := m.usersByEmail[key]; ok {
		return ErrEmailTaken
	}
	m.users[u.ID] = u
	m.usersByEmail[key] = u
	return nil
}

func (m *Memory) GetUserByID(id string) (*models.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	u, ok := m.users[id]
	if !ok {
		return nil, ErrNotFound
	}
	copy := *u
	return &copy, nil
}

func (m *Memory) GetUserByEmail(email string) (*models.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	u, ok := m.usersByEmail[normEmail(email)]
	if !ok {
		return nil, ErrNotFound
	}
	copy := *u
	return &copy, nil
}

func (m *Memory) UpdateUserPassword(userID, passwordHash string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	u, ok := m.users[userID]
	if !ok {
		return ErrNotFound
	}
	u.PasswordHash = passwordHash
	return nil
}

func (m *Memory) CreateRecoveryToken(userID string) (string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.users[userID]; !ok {
		return "", ErrNotFound
	}
	tok := uuid.NewString()
	m.recoveryTokens[tok] = recoveryRecord{
		userID:  userID,
		expires: time.Now().UTC().Add(1 * time.Hour),
	}
	return tok, nil
}

func (m *Memory) ConsumeRecoveryToken(token string) (string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	rec, ok := m.recoveryTokens[token]
	if !ok || time.Now().UTC().After(rec.expires) {
		if ok {
			delete(m.recoveryTokens, token)
		}
		return "", ErrInvalidRecovery
	}
	delete(m.recoveryTokens, token)
	return rec.userID, nil
}

func (m *Memory) CreateClient(c *models.Client) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.clients[c.ID] = c
	return nil
}

func (m *Memory) ListClients() ([]models.Client, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]models.Client, 0, len(m.clients))
	for _, c := range m.clients {
		out = append(out, *c)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].CreatedAt.After(out[j].CreatedAt) })
	return out, nil
}

func (m *Memory) GetClient(id string) (*models.Client, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	c, ok := m.clients[id]
	if !ok {
		return nil, ErrNotFound
	}
	copy := *c
	return &copy, nil
}

func (m *Memory) ListClientsForEmployeeJobs(employeeID string) ([]models.Client, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	seen := make(map[string]struct{})
	for _, j := range m.jobs {
		if j.AssignedEmployeeID == nil || *j.AssignedEmployeeID != employeeID {
			continue
		}
		seen[j.ClientID] = struct{}{}
	}
	out := make([]models.Client, 0, len(seen))
	for cid := range seen {
		if c, ok := m.clients[cid]; ok {
			out = append(out, *c)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

func (m *Memory) CreateEmployee(e *models.Employee) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.employees[e.ID] = e
	return nil
}

func (m *Memory) ListEmployees() ([]models.Employee, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]models.Employee, 0, len(m.employees))
	for _, e := range m.employees {
		out = append(out, *e)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].CreatedAt.After(out[j].CreatedAt) })
	return out, nil
}

func (m *Memory) SetEmployeeActive(id string, active bool) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	e, ok := m.employees[id]
	if !ok {
		return ErrNotFound
	}
	e.IsActive = active
	return nil
}

func (m *Memory) CreateJob(j *models.Job) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.clients[j.ClientID]; !ok {
		return ErrNotFound
	}
	m.jobs[j.ID] = j
	return nil
}

func (m *Memory) ListJobs(employeeID, clientID string) ([]models.Job, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]models.Job, 0, len(m.jobs))
	for _, j := range m.jobs {
		if employeeID != "" {
			if j.AssignedEmployeeID == nil || *j.AssignedEmployeeID != employeeID {
				continue
			}
		}
		if clientID != "" && j.ClientID != clientID {
			continue
		}
		out = append(out, *j)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ScheduledAt.Before(out[j].ScheduledAt) })
	return out, nil
}

func (m *Memory) GetJob(id string) (*models.Job, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	j, ok := m.jobs[id]
	if !ok {
		return nil, ErrNotFound
	}
	copy := *j
	return &copy, nil
}

func jobTerminal(s models.JobStatus) bool {
	return s == models.JobDone || s == models.JobCancelled
}

func (m *Memory) UpdateJobStatus(id string, status models.JobStatus) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	j, ok := m.jobs[id]
	if !ok {
		return ErrNotFound
	}
	if j.Status == models.JobCancelled && status != models.JobCancelled {
		return ErrInvalidStatus
	}
	if j.Status == models.JobDone && status != models.JobDone {
		return ErrInvalidStatus
	}
	j.Status = status
	return nil
}

func (m *Memory) AssignJob(id string, employeeID *string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	j, ok := m.jobs[id]
	if !ok {
		return ErrNotFound
	}
	if jobTerminal(j.Status) {
		return errors.New("cannot reassign finished job")
	}
	if employeeID != nil {
		if _, ex := m.employees[*employeeID]; !ex {
			return ErrNotFound
		}
		if !m.employees[*employeeID].IsActive {
			return errors.New("employee inactive")
		}
		j.AssignedEmployeeID = employeeID
		if j.Status == models.JobPending {
			j.Status = models.JobAssigned
		}
	} else {
		j.AssignedEmployeeID = nil
		if j.Status == models.JobAssigned {
			j.Status = models.JobPending
		}
	}
	return nil
}

func (m *Memory) ActiveEmployees() ([]models.Employee, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var out []models.Employee
	for _, e := range m.employees {
		if e.IsActive {
			out = append(out, *e)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

func (m *Memory) CountActiveJobsByEmployee() (map[string]int, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	counts := make(map[string]int)
	for _, j := range m.jobs {
		if j.AssignedEmployeeID == nil || jobTerminal(j.Status) {
			continue
		}
		counts[*j.AssignedEmployeeID]++
	}
	return counts, nil
}

// Used by tests / seeding
func (m *Memory) Now() time.Time { return time.Now() }
