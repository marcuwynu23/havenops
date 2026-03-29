package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"havenops/internal/models"
)

var ErrInvalidToken = errors.New("invalid token")

type Claims struct {
	UserID     string `json:"uid"`
	Role       string `json:"role"`
	ClientID   string `json:"cid,omitempty"`
	EmployeeID string `json:"eid,omitempty"`
	jwt.RegisteredClaims
}

func SignAccessToken(secret string, u *models.User, ttl time.Duration) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: u.ID,
		Role:   string(u.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   u.ID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
		},
	}
	if u.ClientID != nil {
		claims.ClientID = *u.ClientID
	}
	if u.EmployeeID != nil {
		claims.EmployeeID = *u.EmployeeID
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}

func ParseAccessToken(secret, tokenStr string) (*Claims, error) {
	t, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
		return []byte(secret), nil
	})
	if err != nil || !t.Valid {
		return nil, ErrInvalidToken
	}
	claims, ok := t.Claims.(*Claims)
	if !ok {
		return nil, ErrInvalidToken
	}
	return claims, nil
}
