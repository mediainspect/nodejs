#!/bin/bash

# Start the server
node media_server.js &
SERVER_PID=$!

# Wait for the server to start
sleep 5

# Run curl tests
echo "Testing user registration"
curl -X POST -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpass"}' http://localhost:3000/register

echo "Testing user login"
TOKEN=$(curl -X POST -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpass"}' http://localhost:3000/login | jq -r '.token')

echo "Testing media creation"
curl -X POST -H "Content-Type: application/json" -H "x-access-token: $TOKEN" -d '{"title":"Test Media","type":"video","url":"http://example.com/test.mp4"}' http://localhost:3000/media

echo "Testing media retrieval"
curl -H "x-access-token: $TOKEN" http://localhost:3000/media

# Add more curl tests for other endpoints

# Stop the server
kill $SERVER_PID
