FROM node:14

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Use an environment variable for the port
EXPOSE ${STREAM_SERVER_PORT}

# Use an environment variable for the command
CMD ["sh", "-c", "node $SERVER_FILE"]
