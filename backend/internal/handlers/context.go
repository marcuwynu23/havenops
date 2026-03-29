package handlers

import (
	"context"

	"havenops/internal/models"
)

type ctxKey int

const ctxUser ctxKey = 1

func withUser(ctx context.Context, u *models.User) context.Context {
	return context.WithValue(ctx, ctxUser, u)
}

func userFromCtx(ctx context.Context) *models.User {
	u, _ := ctx.Value(ctxUser).(*models.User)
	return u
}
