# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2023-05-30

### Added
- Implemented file download functionality in the upload script
- Added comprehensive logging for all methods in media_server.js
- Created endpoints to list and download converted files
- Implemented file saving for converted streams

### Changed
- Updated React app to work with new backend functionality
- Refactored upload.sh script to handle both JSON and non-JSON responses
- Modified FFmpeg settings in media_server.js for better compatibility

### Fixed
- Resolved issues with file conversion and download in media_server.js
- Fixed CORS issues between media_server.js and React app

## [0.6.0] - 2023-05-25

### Added
- Implemented CORS support for cross-origin requests
- Created upload.sh script for file uploads using curl with authentication
- Added comprehensive logging using Winston
- Implemented error handling for token extraction in upload.sh

### Changed
- Updated media_server.js to use CORS middleware
- Refactored React components to use the correct API URL from environment variables
- Updated package.json to include new dependencies (cors, winston)

### Fixed
- Resolved CORS issues between media_server.js and React app
- Fixed token extraction in upload.sh script

## [0.5.0] - 2023-05-20

### Added
- React frontend for the media server
- User authentication in the frontend (registration, login, profile)
- Media operations in the frontend (upload, convert, stream conversion)
- Environment variable configuration for the React app
- Separate port configuration for frontend and backend

### Changed
- Updated backend to serve the React app
- Refactored App.js to use functional components and hooks
- Updated API calls to use environment variables for URL and port

### Fixed
- ESLint warnings in App.js
- Resolved conflicts between frontend and backend ports

## [0.4.0] - 2023-05-01

### Added
- Basic React frontend
- Selenium tests for frontend
- test.sh script to run all tests

### Changed
- Updated backend to use environment variables instead of hardcoded values
- Moved all configuration to .env file

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
