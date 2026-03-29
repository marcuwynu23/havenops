# HavenOps API — run from this directory: cd backend && make <target>
# Windows: use Git Bash, MSYS2, or WSL where `make` is available; otherwise run the `go` commands shown in help.

.PHONY: help all run build install test test-race fmt vet tidy clean clean-dist deps release checksums

.DEFAULT_GOAL := help

APP      := havenops
MAIN     := ./cmd/server
BIN_DIR  := bin
DIST_DIR := dist

# Version for release binaries (override: make release VERSION=1.0.0)
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)

LDFLAGS := -s -w -X main.version=$(VERSION)

help: ## Show this help
	@echo "HavenOps backend"
	@echo ""
	@grep -hE '^[a-zA-Z0-9_.-]+:.*?##' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make run                    # dev server on :8080"
	@echo "  HAVENOPS_SEED_DEMO=1 make run   # dev server + demo clients/jobs/users (password: havenops123)"
	@echo "  PORT=3000 make run          # dev server on :3000 (Unix / Git Bash)"
	@echo "  make release                # cross-compile to $(DIST_DIR)/"
	@echo "  make release VERSION=1.0.0"

all: fmt vet test build ## Format, vet, test, and local build

deps: ## Download modules
	go mod download

tidy: ## go mod tidy
	go mod tidy

fmt: ## go fmt
	go fmt ./...

vet: ## go vet
	go vet ./...

test: ## Run tests
	go test ./...

test-race: ## Run tests with -race
	go test -race ./...

run: ## Run server (optional: PORT=8080)
	go run $(MAIN)

build: $(BIN_DIR) ## Build current GOOS/GOARCH -> bin/$(APP) (.exe on Windows)
	go build -trimpath -ldflags "$(LDFLAGS)" -o $(BIN_DIR)/$(APP)$(shell go env GOEXE) $(MAIN)

install: ## Install to GOPATH/bin or GOBIN
	go install -trimpath -ldflags "$(LDFLAGS)" $(MAIN)

$(BIN_DIR):
	mkdir -p $(BIN_DIR)

clean: clean-dist ## Remove bin/ and dist/
	rm -rf $(BIN_DIR)

clean-dist:
	rm -rf $(DIST_DIR)

$(DIST_DIR):
	mkdir -p $(DIST_DIR)

# Cross-compiled release artifacts (static-friendly trimpath + stripped)
release: clean-dist $(DIST_DIR) ## Build release binaries into dist/
	@echo "version=$(VERSION)"
	GOOS=linux   GOARCH=amd64 go build -trimpath -ldflags "$(LDFLAGS)" -o $(DIST_DIR)/$(APP)-linux-amd64 $(MAIN)
	GOOS=linux   GOARCH=arm64 go build -trimpath -ldflags "$(LDFLAGS)" -o $(DIST_DIR)/$(APP)-linux-arm64 $(MAIN)
	GOOS=windows GOARCH=amd64 go build -trimpath -ldflags "$(LDFLAGS)" -o $(DIST_DIR)/$(APP)-windows-amd64.exe $(MAIN)
	GOOS=darwin  GOARCH=amd64 go build -trimpath -ldflags "$(LDFLAGS)" -o $(DIST_DIR)/$(APP)-darwin-amd64 $(MAIN)
	GOOS=darwin  GOARCH=arm64 go build -trimpath -ldflags "$(LDFLAGS)" -o $(DIST_DIR)/$(APP)-darwin-arm64 $(MAIN)
	@echo "Artifacts:"
	@ls -la $(DIST_DIR)

checksums: $(DIST_DIR) ## SHA256 checksums for dist/* (needs shasum or sha256sum)
	@command -v sha256sum >/dev/null 2>&1 && cd $(DIST_DIR) && sha256sum $(APP)-* > checksums.sha256 && cat checksums.sha256 || \
		command -v shasum >/dev/null 2>&1 && cd $(DIST_DIR) && shasum -a 256 $(APP)-* > checksums.sha256 && cat checksums.sha256 || \
		(echo "Install sha256sum or shasum"; exit 1)
