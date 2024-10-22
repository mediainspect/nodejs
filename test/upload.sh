#!/bin/bash

# use .env variables
source .env

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Function to register a new user
register_user() {
    echo "Registering new user..."
    REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/register" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")

    echo "Register response: $REGISTER_RESPONSE"

    if echo "$REGISTER_RESPONSE" | grep -q "User registered successfully"; then
        echo "User registered successfully"
    else
        handle_error "Failed to register user: $REGISTER_RESPONSE"
    fi
}

# Uncomment the next line if you want to register a new user
#register_user

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

# Main script execution



# Upload file
echo "Uploading file..."
UPLOAD_RESPONSE=$(curl -s -X POST "${API_URL}/upload" \
    -H "x-access-token: ${TOKEN}" \
    -F "file=@${FILE_PATH}" \
    -F "outputFormat=${OUTPUT_FORMAT}")

echo "Upload response: $UPLOAD_RESPONSE"

# Check if the response is valid JSON
if echo "$UPLOAD_RESPONSE" | jq empty 2>/dev/null; then
    # Response is valid JSON
    UPLOAD_STATUS=$(echo $UPLOAD_RESPONSE | jq -r '.message // empty')
    if [ -z "$UPLOAD_STATUS" ]; then
        handle_error "Failed to parse upload status from response: $UPLOAD_RESPONSE"
    elif [ "$UPLOAD_STATUS" == "File uploaded and converted successfully" ]; then
        echo "File uploaded and converted successfully"
        FILENAME=$(echo $UPLOAD_RESPONSE | jq -r '.convertedName')
        echo "Converted filename: $(echo $UPLOAD_RESPONSE | jq -r '.convertedName')"
    else
        handle_error "File upload failed: $UPLOAD_STATUS"
    fi
else
    # Response is not valid JSON, treat it as plain text error
    handle_error "Server error: $UPLOAD_RESPONSE"
fi

ehco $FILENAME
# Download file
echo "Downloading converted file..."
DOWNLOAD_COMMAND="curl -O -J -s -X GET \"${API_URL}/download/${FILENAME}\" -H \"x-access-token: ${TOKEN}\""
echo "Download command: $DOWNLOAD_COMMAND"
eval $DOWNLOAD_COMMAND

if [ $? -eq 0 ]; then
    echo "File downloaded successfully: $FILENAME"
else
    handle_error "Failed to download file"
fi
