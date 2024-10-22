#!/bin/bash

# Test stream conversion server
echo "Testing stream conversion server..."
curl "http://localhost:3000/convert?input=http://example.com/test.mp4&inputProtocol=http&outputProtocol=rtmp" -v

# Test file conversion server
echo "Testing file conversion server..."
curl -X POST -F "file=@test_file.mp4" -F "outputFormat=webm" http://localhost:3001/convert -v
