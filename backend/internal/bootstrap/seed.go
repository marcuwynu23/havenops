package bootstrap

import (
	"log"
	"time"

	"github.com/google/uuid"

	"havenops/internal/auth"
	"havenops/internal/models"
	"havenops/internal/store"
)

// Default SQLite dev admin when HAVENOPS_ADMIN_EMAIL and HAVENOPS_ADMIN_PASSWORD are both unset.
// Same password as demo seed for local convenience; override in production.
const (
	DefaultSQLiteAdminEmail    = "admin@havenops.local"
	DefaultSQLiteAdminPassword = "havenops123"
)

// SeedAdmin creates an admin user if email/password are set and the email is not registered.
func SeedAdmin(s store.Store, email, password string) error {
	if email == "" || password == "" {
		return nil
	}
	if _, err := s.GetUserByEmail(email); err == nil {
		return nil
	}
	hash, err := auth.HashPassword(password)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	u := &models.User{
		ID:           uuid.NewString(),
		Email:        email,
		PasswordHash: hash,
		Role:         models.RoleAdmin,
		CreatedAt:    now,
	}
	if err := s.CreateUser(u); err != nil {
		return err
	}
	log.Printf("seeded admin user for email %q", u.Email)
	return nil
}
