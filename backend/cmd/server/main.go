package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"havenops/internal/bootstrap"
	"havenops/internal/handlers"
	"havenops/internal/store"
)

// Set at link time: go build -ldflags "-X main.version=1.2.3"
var version = "dev"

func main() {
	addr := ":8080"
	if v := os.Getenv("PORT"); v != "" {
		addr = ":" + v
	}

	st := store.NewMemory()
	if err := bootstrap.SeedAdmin(st, os.Getenv("HAVENOPS_ADMIN_EMAIL"), os.Getenv("HAVENOPS_ADMIN_PASSWORD")); err != nil {
		log.Fatalf("seed admin: %v", err)
	}
	if os.Getenv("HAVENOPS_SEED_DEMO") == "1" {
		if err := bootstrap.SeedDemo(st); err != nil {
			log.Fatalf("seed demo: %v", err)
		}
	}
	api := &handlers.API{
		Store:               st,
		JWTSecret:           os.Getenv("HAVENOPS_JWT_SECRET"),
		ExposeRecoveryToken: os.Getenv("HAVENOPS_EXPOSE_RECOVERY_TOKEN") == "1",
	}
	if api.JWTSecret == "" {
		log.Println("warning: HAVENOPS_JWT_SECRET unset; using insecure dev default (set in production)")
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Mount("/api", api.Routes())

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	log.Printf("havenops %s listening on %s", version, addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatal(err)
	}
}
