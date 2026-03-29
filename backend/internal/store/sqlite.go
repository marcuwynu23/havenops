package store

import (
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/google/uuid"

	_ "modernc.org/sqlite"

	"havenops/internal/models"
)

// SQLite implements Store backed by a SQLite file (modernc.org/sqlite, pure Go).
type SQLite struct {
	db *sql.DB
}

// OpenSQLite opens or creates a SQLite database at path, runs migrations, and returns a Store.
func OpenSQLite(path string) (*SQLite, error) {
	abs, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}
	if dir := filepath.Dir(abs); dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return nil, err
		}
	}
	dsn, err := sqliteDSN(abs)
	if err != nil {
		return nil, err
	}
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)
	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, err
	}
	if _, err := db.Exec(`PRAGMA foreign_keys = ON`); err != nil {
		_ = db.Close()
		return nil, err
	}
	if _, err := db.Exec(`PRAGMA journal_mode = WAL`); err != nil {
		_ = db.Close()
		return nil, err
	}
	s := &SQLite{db: db}
	if err := s.migrate(); err != nil {
		_ = db.Close()
		return nil, err
	}
	return s, nil
}

func sqliteDSN(abs string) (string, error) {
	p := filepath.ToSlash(abs)
	switch {
	case runtime.GOOS == "windows" && len(p) >= 2 && p[1] == ':':
		p = "/" + p
	case !strings.HasPrefix(p, "/"):
		p = "/" + p
	}
	u := url.URL{Scheme: "file", Path: p}
	return u.String() + "?_busy_timeout=5000", nil
}

// Close releases the database handle.
func (s *SQLite) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

func (s *SQLite) migrate() error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS clients (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			phone TEXT NOT NULL DEFAULT '',
			address TEXT NOT NULL DEFAULT '',
			latitude REAL,
			longitude REAL,
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS employees (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			phone TEXT NOT NULL DEFAULT '',
			is_active INTEGER NOT NULL,
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL COLLATE NOCASE UNIQUE,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL,
			client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
			employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS jobs (
			id TEXT PRIMARY KEY,
			client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
			assigned_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
			service_type TEXT NOT NULL,
			scheduled_at TEXT NOT NULL,
			status TEXT NOT NULL,
			notes TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS recovery_tokens (
			token TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			expires_at TEXT NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id)`,
		`CREATE INDEX IF NOT EXISTS idx_jobs_assigned_employee ON jobs(assigned_employee_id)`,
	}
	for _, q := range stmts {
		if _, err := s.db.Exec(q); err != nil {
			return fmt.Errorf("migrate: %w", err)
		}
	}
	return nil
}

func formatTime(t time.Time) string {
	return t.UTC().Format(time.RFC3339Nano)
}

func parseTime(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, fmt.Errorf("empty time")
	}
	t, err := time.Parse(time.RFC3339Nano, s)
	if err != nil {
		return time.Parse(time.RFC3339, s)
	}
	return t, nil
}

func isUniqueConstraint(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "unique") && strings.Contains(msg, "constraint")
}

func (s *SQLite) CreateClient(c *models.Client) error {
	_, err := s.db.Exec(`
		INSERT INTO clients (id, name, phone, address, latitude, longitude, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		c.ID, c.Name, c.Phone, c.Address, nullableFloat(c.Latitude), nullableFloat(c.Longitude), formatTime(c.CreatedAt),
	)
	return err
}

func nullableFloat(p *float64) interface{} {
	if p == nil {
		return nil
	}
	return *p
}

func (s *SQLite) ListClients() ([]models.Client, error) {
	rows, err := s.db.Query(`
		SELECT id, name, phone, address, latitude, longitude, created_at
		FROM clients ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Client
	for rows.Next() {
		c, err := scanClient(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *c)
	}
	return out, rows.Err()
}

func scanClient(sc interface {
	Scan(dest ...any) error
}) (*models.Client, error) {
	var c models.Client
	var lat, lon sql.NullFloat64
	var created string
	if err := sc.Scan(&c.ID, &c.Name, &c.Phone, &c.Address, &lat, &lon, &created); err != nil {
		return nil, err
	}
	if lat.Valid {
		v := lat.Float64
		c.Latitude = &v
	}
	if lon.Valid {
		v := lon.Float64
		c.Longitude = &v
	}
	t, err := parseTime(created)
	if err != nil {
		return nil, err
	}
	c.CreatedAt = t
	return &c, nil
}

func (s *SQLite) GetClient(id string) (*models.Client, error) {
	row := s.db.QueryRow(`
		SELECT id, name, phone, address, latitude, longitude, created_at FROM clients WHERE id = ?`, id)
	c, err := scanClient(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return c, nil
}

func (s *SQLite) UpdateClient(c *models.Client) error {
	res, err := s.db.Exec(`
		UPDATE clients SET name = ?, phone = ?, address = ?, latitude = ?, longitude = ?, created_at = ?
		WHERE id = ?`,
		c.Name, c.Phone, c.Address, nullableFloat(c.Latitude), nullableFloat(c.Longitude), formatTime(c.CreatedAt), c.ID,
	)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *SQLite) ListClientsForEmployeeJobs(employeeID string) ([]models.Client, error) {
	rows, err := s.db.Query(`
		SELECT DISTINCT c.id, c.name, c.phone, c.address, c.latitude, c.longitude, c.created_at
		FROM clients c
		INNER JOIN jobs j ON j.client_id = c.id
		WHERE j.assigned_employee_id = ?
		ORDER BY c.name ASC`, employeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Client
	for rows.Next() {
		c, err := scanClient(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *c)
	}
	return out, rows.Err()
}

func (s *SQLite) CreateEmployee(e *models.Employee) error {
	active := 0
	if e.IsActive {
		active = 1
	}
	_, err := s.db.Exec(`
		INSERT INTO employees (id, name, phone, is_active, created_at)
		VALUES (?, ?, ?, ?, ?)`,
		e.ID, e.Name, e.Phone, active, formatTime(e.CreatedAt),
	)
	return err
}

func (s *SQLite) ListEmployees() ([]models.Employee, error) {
	rows, err := s.db.Query(`
		SELECT id, name, phone, is_active, created_at FROM employees ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Employee
	for rows.Next() {
		e, err := scanEmployee(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *e)
	}
	return out, rows.Err()
}

func scanEmployee(sc interface {
	Scan(dest ...any) error
}) (*models.Employee, error) {
	var e models.Employee
	var active int
	var created string
	if err := sc.Scan(&e.ID, &e.Name, &e.Phone, &active, &created); err != nil {
		return nil, err
	}
	e.IsActive = active != 0
	t, err := parseTime(created)
	if err != nil {
		return nil, err
	}
	e.CreatedAt = t
	return &e, nil
}

func (s *SQLite) SetEmployeeActive(id string, active bool) error {
	a := 0
	if active {
		a = 1
	}
	res, err := s.db.Exec(`UPDATE employees SET is_active = ? WHERE id = ?`, a, id)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *SQLite) CreateUser(u *models.User) error {
	u.Email = normEmail(u.Email)
	_, err := s.db.Exec(`
		INSERT INTO users (id, email, password_hash, role, client_id, employee_id, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		u.ID, u.Email, u.PasswordHash, string(u.Role), nullableString(u.ClientID), nullableString(u.EmployeeID), formatTime(u.CreatedAt),
	)
	if err != nil && isUniqueConstraint(err) {
		return ErrEmailTaken
	}
	return err
}

func nullableString(p *string) interface{} {
	if p == nil {
		return nil
	}
	return *p
}

func (s *SQLite) GetUserByID(id string) (*models.User, error) {
	row := s.db.QueryRow(`
		SELECT id, email, password_hash, role, client_id, employee_id, created_at FROM users WHERE id = ?`, id)
	return scanUserRow(row)
}

func (s *SQLite) GetUserByEmail(email string) (*models.User, error) {
	row := s.db.QueryRow(`
		SELECT id, email, password_hash, role, client_id, employee_id, created_at FROM users WHERE email = ?`, normEmail(email))
	return scanUserRow(row)
}

func scanUserRow(row *sql.Row) (*models.User, error) {
	var u models.User
	var role string
	var clientID, employeeID sql.NullString
	var created string
	if err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &role, &clientID, &employeeID, &created); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	u.Role = models.Role(role)
	if clientID.Valid {
		v := clientID.String
		u.ClientID = &v
	}
	if employeeID.Valid {
		v := employeeID.String
		u.EmployeeID = &v
	}
	t, err := parseTime(created)
	if err != nil {
		return nil, err
	}
	u.CreatedAt = t
	return &u, nil
}

func (s *SQLite) UpdateUserPassword(userID, passwordHash string) error {
	res, err := s.db.Exec(`UPDATE users SET password_hash = ? WHERE id = ?`, passwordHash, userID)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *SQLite) CreateRecoveryToken(userID string) (string, error) {
	var one int
	if err := s.db.QueryRow(`SELECT 1 FROM users WHERE id = ?`, userID).Scan(&one); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", ErrNotFound
		}
		return "", err
	}
	tok := uuid.NewString()
	exp := formatTime(time.Now().UTC().Add(time.Hour))
	_, err := s.db.Exec(`INSERT INTO recovery_tokens (token, user_id, expires_at) VALUES (?, ?, ?)`, tok, userID, exp)
	return tok, err
}

func (s *SQLite) ConsumeRecoveryToken(token string) (string, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return "", err
	}
	defer func() { _ = tx.Rollback() }()

	var userID, expStr string
	err = tx.QueryRow(`SELECT user_id, expires_at FROM recovery_tokens WHERE token = ?`, token).Scan(&userID, &expStr)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", ErrInvalidRecovery
		}
		return "", err
	}
	exp, err := parseTime(expStr)
	if err != nil {
		_, _ = tx.Exec(`DELETE FROM recovery_tokens WHERE token = ?`, token)
		if e := tx.Commit(); e != nil {
			return "", e
		}
		return "", ErrInvalidRecovery
	}
	if time.Now().UTC().After(exp) {
		_, _ = tx.Exec(`DELETE FROM recovery_tokens WHERE token = ?`, token)
		if e := tx.Commit(); e != nil {
			return "", e
		}
		return "", ErrInvalidRecovery
	}
	if _, err := tx.Exec(`DELETE FROM recovery_tokens WHERE token = ?`, token); err != nil {
		return "", err
	}
	if err := tx.Commit(); err != nil {
		return "", err
	}
	return userID, nil
}

func (s *SQLite) CreateJob(j *models.Job) error {
	var one int
	if err := s.db.QueryRow(`SELECT 1 FROM clients WHERE id = ?`, j.ClientID).Scan(&one); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	_, err := s.db.Exec(`
		INSERT INTO jobs (id, client_id, assigned_employee_id, service_type, scheduled_at, status, notes, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		j.ID, j.ClientID, nullableString(j.AssignedEmployeeID), j.ServiceType, formatTime(j.ScheduledAt), string(j.Status), j.Notes, formatTime(j.CreatedAt),
	)
	return err
}

func (s *SQLite) ListJobs(employeeID, clientID string) ([]models.Job, error) {
	q := `SELECT id, client_id, assigned_employee_id, service_type, scheduled_at, status, notes, created_at FROM jobs WHERE 1=1`
	var args []any
	if employeeID != "" {
		q += ` AND assigned_employee_id = ?`
		args = append(args, employeeID)
	}
	if clientID != "" {
		q += ` AND client_id = ?`
		args = append(args, clientID)
	}
	q += ` ORDER BY scheduled_at ASC`
	rows, err := s.db.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Job
	for rows.Next() {
		j, err := scanJob(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *j)
	}
	return out, rows.Err()
}

func scanJob(sc interface {
	Scan(dest ...any) error
}) (*models.Job, error) {
	var j models.Job
	var emp sql.NullString
	var status, sched, created string
	if err := sc.Scan(&j.ID, &j.ClientID, &emp, &j.ServiceType, &sched, &status, &j.Notes, &created); err != nil {
		return nil, err
	}
	if emp.Valid {
		v := emp.String
		j.AssignedEmployeeID = &v
	}
	j.Status = models.JobStatus(status)
	var err error
	j.ScheduledAt, err = parseTime(sched)
	if err != nil {
		return nil, err
	}
	j.CreatedAt, err = parseTime(created)
	if err != nil {
		return nil, err
	}
	return &j, nil
}

func (s *SQLite) GetJob(id string) (*models.Job, error) {
	row := s.db.QueryRow(`
		SELECT id, client_id, assigned_employee_id, service_type, scheduled_at, status, notes, created_at FROM jobs WHERE id = ?`, id)
	j, err := scanJob(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return j, nil
}

func jobIsTerminal(st models.JobStatus) bool {
	return st == models.JobDone || st == models.JobCancelled
}

func (s *SQLite) UpdateJobStatus(id string, status models.JobStatus) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	var cur string
	if err := tx.QueryRow(`SELECT status FROM jobs WHERE id = ?`, id).Scan(&cur); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	curSt := models.JobStatus(cur)
	if curSt == models.JobCancelled && status != models.JobCancelled {
		return ErrInvalidStatus
	}
	if curSt == models.JobDone && status != models.JobDone {
		return ErrInvalidStatus
	}
	if _, err := tx.Exec(`UPDATE jobs SET status = ? WHERE id = ?`, string(status), id); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *SQLite) AssignJob(id string, employeeID *string) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	var st string
	var assigned sql.NullString
	if err := tx.QueryRow(`SELECT status, assigned_employee_id FROM jobs WHERE id = ?`, id).Scan(&st, &assigned); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	jStatus := models.JobStatus(st)
	if jobIsTerminal(jStatus) {
		return errors.New("cannot reassign finished job")
	}

	if employeeID != nil {
		var active int
		if err := tx.QueryRow(`SELECT is_active FROM employees WHERE id = ?`, *employeeID).Scan(&active); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return ErrNotFound
			}
			return err
		}
		if active == 0 {
			return errors.New("employee inactive")
		}
		if _, err := tx.Exec(`UPDATE jobs SET assigned_employee_id = ? WHERE id = ?`, *employeeID, id); err != nil {
			return err
		}
		if jStatus == models.JobPending {
			if _, err := tx.Exec(`UPDATE jobs SET status = ? WHERE id = ?`, string(models.JobAssigned), id); err != nil {
				return err
			}
		}
	} else {
		if _, err := tx.Exec(`UPDATE jobs SET assigned_employee_id = NULL WHERE id = ?`, id); err != nil {
			return err
		}
		if jStatus == models.JobAssigned {
			if _, err := tx.Exec(`UPDATE jobs SET status = ? WHERE id = ?`, string(models.JobPending), id); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

func (s *SQLite) ActiveEmployees() ([]models.Employee, error) {
	rows, err := s.db.Query(`
		SELECT id, name, phone, is_active, created_at FROM employees WHERE is_active != 0 ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Employee
	for rows.Next() {
		e, err := scanEmployee(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *e)
	}
	return out, rows.Err()
}

func (s *SQLite) CountActiveJobsByEmployee() (map[string]int, error) {
	rows, err := s.db.Query(`
		SELECT assigned_employee_id, COUNT(*) FROM jobs
		WHERE assigned_employee_id IS NOT NULL
		AND status NOT IN ('done', 'cancelled')
		GROUP BY assigned_employee_id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	counts := make(map[string]int)
	for rows.Next() {
		var empID string
		var n int
		if err := rows.Scan(&empID, &n); err != nil {
			return nil, err
		}
		counts[empID] = n
	}
	return counts, rows.Err()
}
