---
title: Spring Boot API
emoji: 🚀
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# Spring Boot API on Hugging Face Spaces

A Spring Boot REST API deployed on Hugging Face Spaces using Docker.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| GET | `/api/hello?name={name}` | Returns a greeting message |
| POST | `/api/echo` | Echoes back the JSON body |

## Example Usage

### Health Check
```bash
curl https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/health
```

### Hello Endpoint
```bash
curl https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/hello?name=Developer
```

### Echo Endpoint
```bash
curl -X POST https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from Hugging Face!"}'
```

## Local Development

### Prerequisites
- Java 21 (or use the Maven wrapper which handles this)
- Maven 3.9+ (optional, wrapper included)
- Docker (optional, for container testing)

### Run with Maven
```bash
# On Linux/macOS
./mvnw spring-boot:run

# On Windows
mvnw.cmd spring-boot:run
```

The app will start on `http://localhost:7860`

### Build and Run with Docker
```bash
# Build the image
docker build -t springboot-hf .

# Run the container
docker run -p 7860:7860 springboot-hf
```

## Deploy to Hugging Face Spaces

### Option 1: Push Entire Backend Folder as a Space

1. Create a new Space on [Hugging Face](https://huggingface.co/new-space)
   - Select **Docker** as the SDK
   - Choose a name for your Space

2. Clone your new Space repository:
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
   cd YOUR_SPACE_NAME
   ```

3. Copy the contents of this `backend` folder into the Space:
   ```bash
   # Copy all files from backend folder
   cp -r /path/to/backend/* .
   ```

4. Push to Hugging Face:
   ```bash
   git add .
   git commit -m "Initial Spring Boot deployment"
   git push
   ```

### Option 2: Direct Git Push (if backend is standalone)

1. Add Hugging Face as a remote:
   ```bash
   cd backend
   git init  # if not already a git repo
   git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
   ```

2. Push to Hugging Face:
   ```bash
   git add .
   git commit -m "Deploy Spring Boot to HF Spaces"
   git push hf main
   ```

### Important Notes for Hugging Face Spaces

- The app **must** run on port **7860** (already configured)
- The container runs as a **non-root user** (UID 1000) - this is required by HF Spaces
- Build times may vary; initial deployment can take a few minutes
- Check the **Logs** tab in your Space for debugging

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/backend/cs203/
│   │   │   └── Cs203Application.java    # Main entry point
│   │   └── resources/
│   │       └── application.properties   # App configuration
│   └── test/
├── pom.xml                              # Maven dependencies
├── Dockerfile                           # Multi-stage Docker build
└── README.md                            # This file
```

## Tech Stack

- **Java 21**
- **Spring Boot 4.0.1**
- **Maven** (with wrapper)
- **Docker** (multi-stage build)
