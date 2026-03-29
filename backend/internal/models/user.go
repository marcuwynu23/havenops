package models

import "time"

type Role string

const (
	RoleAdmin    Role = "admin"
	RoleEmployee Role = "employee"
	RoleClient   Role = "client"
)

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         Role      `json:"role"`
	ClientID     *string   `json:"client_id,omitempty"`
	EmployeeID   *string   `json:"employee_id,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserPublic struct {
	ID         string  `json:"id"`
	Email      string  `json:"email"`
	Role       Role    `json:"role"`
	ClientID   *string `json:"client_id,omitempty"`
	EmployeeID *string `json:"employee_id,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

func (u *User) Public() UserPublic {
	return UserPublic{
		ID:         u.ID,
		Email:      u.Email,
		Role:       u.Role,
		ClientID:   u.ClientID,
		EmployeeID: u.EmployeeID,
		CreatedAt:  u.CreatedAt,
	}
}
