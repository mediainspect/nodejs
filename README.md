# Media Processing Server

This project contains two lightweight media servers for processing audio and video files:

1. A server for converting streams from one protocol to another
2. A server for converting media file formats during upload

## Features

- Stream conversion between different protocols (RTP, RTSP, HLS, DASH, WebRTC, SIP, RTMP, HTTP Live Streaming, MPEG-DASH, NDI)
- Media file format conversion during upload
- Supports various audio and video formats
- Uses FFmpeg for media processing

## Prerequisites

- Node.js (v14 or later)
- FFmpeg
- Docker and Docker Compose (for containerized deployment)

## Installation

1. Clone the repository:   ```
   git clone https://github.com/yourusername/media-processing-server.git
   cd media-processing-server   ```

2. Install dependencies:   ```
   npm install   ```

3. Make sure FFmpeg is installed on your system.

## Usage

### Stream Conversion Server

Start the server:

