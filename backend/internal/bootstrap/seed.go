package bootstrap

import (
	"errors"
	"log"
	"os"
	"time"

	"github.com/google/uuid"

	"havenops/internal/auth"
	"havenops/internal/models"
	"havenops/internal/store"
)

// Default dev admin when HAVENOPS_ADMIN_EMAIL and HAVENOPS_ADMIN_PASSWORD are both unset.
// Same password as demo seed for local convenience; set env vars in production.
const (
	DefaultSQLiteAdminEmail    = "admin@havenops.local"
	DefaultSQLiteAdminPassword = "havenops123"
)

// EnsureAdminFromEnv runs on every startup: resolves admin email/password from env or defaults,
// then ensures that user exists (creates once; never overwrites an existing account).
func EnsureAdminFromEnv(s store.Store) error {
	email := os.Getenv("HAVENOPS_ADMIN_EMAIL")
	password := os.Getenv("HAVENOPS_ADMIN_PASSWORD")
	if email == "" && password == "" {
		email = DefaultSQLiteAdminEmail
		password = DefaultSQLiteAdminPassword
	}
	return SeedAdmin(s, email, password)
}

// SeedAdmin creates an admin user if email and password are non-empty and that email is not
// already registered. Idempotent: existing users are left unchanged.
func SeedAdmin(s store.Store, email, password string) error {
	if email == "" || password == "" {
		return nil
	}
	_, err := s.GetUserByEmail(email)
	if err == nil {
		log.Printf("admin seed skipped: %q already exists", email)
		return nil
	}
	if !errors.Is(err, store.ErrNotFound) {
		return err
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
		if errors.Is(err, store.ErrEmailTaken) {
			log.Printf("admin seed skipped: %q already exists", email)
			return nil
		}
		return err
	}
	log.Printf("seeded admin user for email %q", u.Email)
	return nil
}
