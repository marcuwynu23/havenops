package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"havenops/internal/auth"
	"havenops/internal/models"
	"havenops/internal/store"
)

const minPasswordLen = 8

func (a *API) jwtSecret() string {
	if a.JWTSecret != "" {
		return a.JWTSecret
	}
	return "dev-insecure-change-me"
}

func (a *API) jwtTTL() time.Duration {
	if a.JWTExpiry > 0 {
		return a.JWTExpiry
	}
	return 48 * time.Hour
}

type registerBody struct {
	Email   string `json:"email"`
	Password string `json:"password"`
	Name    string `json:"name"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
}

func (a *API) postRegister(w http.ResponseWriter, r *http.Request) {
	var body registerBody
	if err := readJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	body.Email = strings.TrimSpace(body.Email)
	if body.Email == "" || body.Password == "" || body.Name == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "email, password, and name required"})
		return
	}
	if len(body.Password) < minPasswordLen {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "password must be at least 8 characters"})
		return
	}
	hash, err := auth.HashPassword(body.Password)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not hash password"})
		return
	}
	now := time.Now().UTC()
	cid := uuid.NewString()
	client := &models.Client{
		ID:        cid,
		Name:      body.Name,
		Phone:     body.Phone,
		Address:   body.Address,
		CreatedAt: now,
	}
	if err := a.Store.CreateClient(client); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	uid := uuid.NewString()
	u := &models.User{
		ID:           uid,
		Email:        body.Email,
		PasswordHash: hash,
		Role:         models.RoleClient,
		ClientID:     &cid,
		CreatedAt:    now,
	}
	if err := a.Store.CreateUser(u); err != nil {
		if err == store.ErrEmailTaken {
			writeJSON(w, http.StatusConflict, map[string]string{"error": "email already registered"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	token, err := auth.SignAccessToken(a.jwtSecret(), u, a.jwtTTL())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not sign token"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{
		"token": token,
		"user":  u.Public(),
	})
}

type loginBody struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (a *API) postLogin(w http.ResponseWriter, r *http.Request) {
	var body loginBody
	if err := readJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	u, err := a.Store.GetUserByEmail(body.Email)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
		return
	}
	if !auth.CheckPassword(u.PasswordHash, body.Password) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
		return
	}
	token, err := auth.SignAccessToken(a.jwtSecret(), u, a.jwtTTL())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not sign token"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"token": token,
		"user":  u.Public(),
	})
}

func (a *API) getMe(w http.ResponseWriter, r *http.Request) {
	u := userFromCtx(r.Context())
	if u == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	writeJSON(w, http.StatusOK, u.Public())
}

type recoveryRequestBody struct {
	Email string `json:"email"`
}

func (a *API) postRecoveryRequest(w http.ResponseWriter, r *http.Request) {
	var body recoveryRequestBody
	if err := readJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	u, err := a.Store.GetUserByEmail(body.Email)
	out := map[string]any{
		"message": "If an account exists for this email, you can complete password reset with the token.",
	}
	if err == nil {
		tok, err := a.Store.CreateRecoveryToken(u.ID)
		if err == nil && a.ExposeRecoveryToken {
			out["recovery_token"] = tok
		}
	}
	writeJSON(w, http.StatusOK, out)
}

type recoveryResetBody struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

func (a *API) postRecoveryReset(w http.ResponseWriter, r *http.Request) {
	var body recoveryResetBody
	if err := readJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	if body.Token == "" || len(body.NewPassword) < minPasswordLen {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "token and new_password (min 8 chars) required"})
		return
	}
	uid, err := a.Store.ConsumeRecoveryToken(body.Token)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid or expired token"})
		return
	}
	hash, err := auth.HashPassword(body.NewPassword)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not hash password"})
		return
	}
	if err := a.Store.UpdateUserPassword(uid, hash); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "password updated"})
}
