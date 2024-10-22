# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2023-04-16

### Added
- Created a basic React frontend
- Added Selenium tests for the frontend
- Created a `test.sh` script to run all tests (backend, frontend, server, and Ansible)

### Changed
- Updated README.md with instructions for running all tests
- Updated TODO.md to reflect new completed tasks

## [0.2.0] - 2023-04-15

### Added
- Moved all CSV and JSON data files to a new 'data' folder
- Created initialization script (init.sh) with all setup commands
- Added input validation for media item creation and updates
- Implemented pagination for GET /media endpoint
- Created unit tests for all endpoints
- Set up continuous integration with GitHub Actions
- Created server and curl tests
- Created Ansible tests

### Changed
- Updated paths to CSV and JSON files in .env file
- Modified media_server.js to use new file paths
- Updated README.md with new configuration instructions
- Updated docker-compose.yml to include new environment variables and volume mounts

### Fixed
- Improved error handling in media_server.js

## [0.1.0] - 2023-04-14

### Added
- Basic CRUD operations for media items
- Error handling for port conflicts
- CSV and JSON file lists for audio/video protocols and file extensions
- Light protocol to transfer and convert streams from one protocol to another
- Environment variable support using dotenv
- Generic media operations structure (convert, transcode, extractAudio, extractMetadata)
- Endpoint for generic media operations

### Changed
- Updated server to use environment variables from .env file
- Improved error handling when starting the server

### Fixed
- Server now attempts to find an available port if the default port is in use
