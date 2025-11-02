# Stellar Scholarship Contract Makefile
# Following Stellar's Hello World pattern

# Default target
default: build

# Build the contract
build:
	cargo build --target wasm32v1-none --release

# Run tests
test:
	cargo test

# Clean build artifacts
clean:
	cargo clean

# Check syntax without building
check:
	cargo check --target wasm32v1-none

# Format code
fmt:
	cargo fmt

# Run clippy for linting
clippy:
	cargo clippy --target wasm32v1-none

# Watch for changes and rebuild
watch:
	cargo watch -x "build --target wasm32v1-none --release"

# Deploy contract (requires stellar CLI)
deploy:
	stellar contract deploy --wasm target/wasm32v1-none/release/scholarship.wasm --source alice --network testnet

# Install contract (upload + deploy in one step)
install:
	stellar contract install --wasm target/wasm32v1-none/release/scholarship.wasm --source alice --network testnet

# Initialize contract after deployment
init:
	stellar contract invoke --id $(CONTRACT_ID) --source alice --network testnet -- init --admin $(ADMIN_ADDRESS)

# Help target
help:
	@echo "Available targets:"
	@echo "  build     - Build the contract"
	@echo "  test      - Run tests"
	@echo "  clean     - Clean build artifacts"
	@echo "  check     - Check syntax"
	@echo "  fmt       - Format code"
	@echo "  clippy    - Run linting"
	@echo "  watch     - Watch and rebuild"
	@echo "  deploy    - Deploy contract (requires stellar CLI)"
	@echo "  install   - Install contract (upload + deploy)"
	@echo "  init      - Initialize contract"
	@echo "  help      - Show this help"

.PHONY: default build test clean check fmt clippy watch deploy install init help