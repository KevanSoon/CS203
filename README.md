# 🧠 SimiSlang — Community-Driven Gen Alpha Slang Learning Platform

## 🌐 Live Demo
👉 https://simislang.vercel.app/

---

## 📌 Overview

**SimiSlang** is a community-driven self-learning platform designed to help users **access, create, and verify lessons on Gen Alpha slang**.

The platform enhances comprehension by integrating **AI to contextualize slang using localized Singlish equivalents**, making learning more culturally relatable and intuitive.

To further support learning:
- **AI-powered learning assistants** provide real-time clarification  
- A **community verification system** ensures content accuracy  
- Reduces misinformation and low-quality AI-generated content  

---

## 🎯 Project Objectives

- Enable users to **learn Gen Alpha slang in a structured lesson format**
- Provide **AI-assisted explanations using localized Singlish context**
- Allow users to **create, rate, and verify lesson content**
- Reduce **AI hallucination ("AI slop")** via validation systems
- Promote **collaborative, self-paced learning**

---

## ✨ Key Features

### 📚 Lesson Learning System
- Structured: Lessons → Chapters → Cards → Quizzes  
- Progress tracking & learning streaks  
- Tag-based filtering  

### 🤖 AI Learning Assistant
- Context-aware slang explanations  
- Singlish-based contextualisation  
- Interactive chatbot  

### 👥 Community Verification
- Lesson rating & feedback  
- Peer validation of AI content  
- Moderation system  

### 🧑‍💻 User & Social Features
- User profiles & achievements  
- Friend system  
- Personalized dashboard  

---

## 🏗️ Tech Stack

### Frontend
- Next.js (App Router)  
- Tailwind CSS  
- Axios *(⚠️ Avoid latest version as of 1 Apr 2026 due to security concerns)*  

### Backend
- Java Spring Boot  
- Spring Security (JWT Authentication)  

### Database & Vector Store
- MySQL  
- Supabase  

### Storage
- Supabase Storage  

### AI Services
- Ollama (LLM for chatbot & explanations)  
- `google/embeddinggemma-300M` (embedding model)  
- Supabase RPC for Hybrid Search (Keyword + Semantic via RRF)  
- DeepEval (LLM-as-a-judge for detecting low-quality AI content)  

---

## 🧩 System Architecture

![System Architecture Diagram](system-architecture.png)

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js (v18+)  
- Java 21  
- MySQL  
- Python 3.10+  
- Ollama  
- Supabase Project  

---

## 🔧 Setup Instructions

### 🔹 Frontend

```bash
cd frontend
npm install
npm run dev
```

### 🔹 Backend
```bash
cd backend
./mvnw spring-boot:run
```
### 🔹 Backend-ai
```bash
cd backend-ai
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

pip install -r requirements.txt
uvicorn app:app --reload --port 5000
```

## ⚙️ Environment Variables

### 🖥️ Frontend .env
```bash
NEXT_PUBLIC_BACKEND_PUBLIC_BASE=http://localhost:3000
BACKEND_URL=http://localhost:7860
AI_BACKEND_URL=http://localhost:5000
```

### 🖥️ Backend .env
```bash
DB_HOST=your_database_host
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=your_database_name
DB_PORT=3306

JWT_SECRET=your_jwt_secret

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_TOKEN=your_service_token
SUPABASE_STORAGE_BUCKET=your_bucket_name

RESEND_API_KEY=your_api_key
RESEND_FROM_EMAIL=your_email
```

### 🖥️ Backend-ai .env
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_DB_URI=your_supabase_uri

EMBEDDING_API_URL=your_embedding_api
HF_TOKEN=your_huggingface_token

OLLAMA_MODEL=llama3
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_API_KEY=

CORS_ORIGINS=http://localhost:3000
VERDICT_THRESHOLD=0.7

TAVILY_API_KEY=your_tavily_api_key
JWT_SECRET=your_jwt_secret
```

## 🤝 Contributors
### SMU CS203 G1 Team 4
- Zion Tan Yi En
- Soon Shi Heng Kevan
- Ong Jiong Hui
- Muhammad Ashraf Bin Mustafa
- Wee Lu Xuan
- Darrion Ong Wei Zhi 
