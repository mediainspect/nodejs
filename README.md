# Media Server

A lightweight media server for handling various audio and video operations, including format conversion, streaming, and on-the-fly file uploads with conversion.

## Features

- Basic CRUD operations for media items
- Stream conversion between different protocols
- On-the-fly media format conversion during upload
- Support for various media operations (convert, transcode, extract audio, etc.)
- Error handling and automatic port selection
- Configurable file paths for data files (CSV and JSON)

## Prerequisites

- Node.js (v14 or later recommended)
- FFmpeg installed on the system

## Installation

1. Clone the repository:   ```
   git clone https://github.com/yourusername/media-server.git
   cd media-server   ```

2. Run the initialization script:   ```
   chmod +x init.sh
   ./init.sh   ```

   This script will:
   - Install system dependencies
   - Install project dependencies
   - Create necessary directories
   - Set up environment variables
   - Run tests
   - Start the server
   - Run server tests
   - Run Ansible playbook
   - Stop the server

3. After running the init script, edit the `.env` file with your specific configurations, including paths to CSV and JSON files.

## Usage

1. Start the server:   ```
   node media_server.js   ```

2. The server will start on the specified port (default: 3000) or the next available port.

3. Use the following endpoints:

   - GET `/convert`: Convert streams between protocols     ```
     curl "http://localhost:3000/convert?input=<input_url>&inputProtocol=<input_protocol>&outputProtocol=<output_protocol>"     ```

   - POST `/media/operation`: Perform media operations     ```
     curl -X POST -H "Content-Type: application/json" -d '{"operation": "convert", "input": "input.mp4", "params": ["output.avi"]}' http://localhost:3000/media/operation     ```

   - POST `/upload`: Upload and convert media files     ```
     curl -X POST -F "file=@/path/to/file.mp4" -F "outputFormat=avi" http://localhost:3000/upload     ```

## Configuration

This project uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

## Supported Protocols

See the file specified by `PROTOCOLS_JSON_PATH` in the `.env` file for a list of supported protocols.

## Supported File Extensions

See the file specified by `FILE_EXTENSIONS_JSON_PATH` in the `.env` file for a list of supported file extensions and their MIME types.

## Available Media Operations

See the file specified by `OPERATIONS_JSON_PATH` in the `.env` file for a list of available media operations.

## Media Recognition Functions

See the file specified by `RECOGNITION_FUNCTIONS_JSON_PATH` in the `.env` file for a list of supported media recognition functions.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Testing

To run all tests (backend, frontend, server, and Ansible), use the following command:

## Combined Frontend and Backend Setup

This project combines a React frontend with an Express backend. The frontend is located in the `app` directory, while the backend is in the root directory.

To run the combined application:

1. Install dependencies:   ```
   npm install
   cd app && npm install   ```

2. Build the frontend:   ```
   npm run build   ```

3. Start the server:   ```
   npm start   ```

The server will serve the React app and handle API requests.
