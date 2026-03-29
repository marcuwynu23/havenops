package store

import "errors"

var (
	ErrEmailTaken      = errors.New("email already registered")
	ErrInvalidRecovery = errors.New("invalid or expired recovery token")
)
