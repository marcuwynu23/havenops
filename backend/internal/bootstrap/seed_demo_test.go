package bootstrap

import (
	"testing"

	"havenops/internal/store"
)

func TestSeedDemo_Idempotent(t *testing.T) {
	s := store.NewMemory()
	if err := SeedDemo(s); err != nil {
		t.Fatal(err)
	}
	clients1, _ := s.ListClients()
	jobs1, _ := s.ListJobs("", "")
	if len(clients1) != 3 || len(jobs1) != 6 {
		t.Fatalf("first seed: got %d clients, %d jobs", len(clients1), len(jobs1))
	}
	if err := SeedDemo(s); err != nil {
		t.Fatal(err)
	}
	clients2, _ := s.ListClients()
	jobs2, _ := s.ListJobs("", "")
	if len(clients2) != 3 || len(jobs2) != 6 {
		t.Fatalf("second seed should noop: got %d clients, %d jobs", len(clients2), len(jobs2))
	}
}
