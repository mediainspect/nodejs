#!/bin/bash

# Configuration
API_URL="http://localhost:3005"
USERNAME="tom@sapletta.com"
PASSWORD="tom@sapletta.com"
FILE_PATH="./media/1.mp4"
OUTPUT_FORMAT="mp4"

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Login and get token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")

echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    handle_error "Failed to get authentication token"
fi

echo "Successfully logged in and got token"

# Upload file
echo "Uploading file..."
UPLOAD_RESPONSE=$(curl -s -X POST "${API_URL}/upload" \
    -H "x-access-token: ${TOKEN}" \
    -F "file=@${FILE_PATH}" \
    -F "outputFormat=${OUTPUT_FORMAT}")

echo "Upload response: $UPLOAD_RESPONSE"

UPLOAD_STATUS=$(echo $UPLOAD_RESPONSE | jq -r '.message')

if [ "$UPLOAD_STATUS" == "File uploaded and converted successfully" ]; then
    echo "File uploaded and converted successfully"
    echo "Converted filename: $(echo $UPLOAD_RESPONSE | jq -r '.convertedName')"
else
    handle_error "File upload failed: $UPLOAD_STATUS"
fi
