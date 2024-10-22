#!/bin/bash

# Exit on any error
set -e

# Function to run tests
run_tests() {
    echo "Running $1 tests..."
    $2
    echo "$1 tests completed."
    echo
}

# Backend tests
run_tests "Backend" "npm test"

# Frontend tests
cd frontend
run_tests "Frontend unit" "npm test -- --watchAll=false"
run_tests "Frontend Selenium" "npm run test:selenium"
cd ..

# Server tests
run_tests "Server" "./server_tests.sh"

# Ansible tests
run_tests "Ansible" "ansible-playbook ansible_playbook.yml"

echo "All tests completed successfully!"
