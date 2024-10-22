#!/bin/bash

# Exit on any error
set -e

# Update package list and install required system dependencies
echo "Updating package list and installing system dependencies..."
sudo apt-get update
sudo apt-get install -y nodejs npm ffmpeg

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Create necessary directories
echo "Creating upload and converted directories..."
mkdir -p uploads converted

# Set up environment variables
echo "Setting up environment variables..."
cp .env.example .env
echo "Please edit the .env file with your specific configurations."

# Run tests
echo "Running tests..."
npm test

# Start the server
echo "Starting the media server..."
node media_server.js &

# Wait for the server to start
echo "Waiting for the server to start..."
sleep 5

# Run server tests
echo "Running server tests..."
bash server_tests.sh

# Run Ansible playbook
echo "Running Ansible playbook..."
ansible-playbook ansible_playbook.yml

# Stop the server
echo "Stopping the media server..."
pkill -f "node media_server.js"

echo "Initialization complete!"
