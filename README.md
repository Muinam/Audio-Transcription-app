# VoiceScript - AI Audio Transcription App

> Upload an audio file and get the text transcript in seconds, powered by OpenAI Whisper AI.

![Tech Stack](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Whisper](https://img.shields.io/badge/Whisper-tiny-412991?style=flat-square&logo=openai)
![Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

---

## What This App Does

VoiceScript is a full-stack web app that:
- Accepts audio file uploads (.mp3, .wav, .m4a, .ogg, .flac)
- Converts audio to text using the Whisper AI model
- Auto-detects the spoken language
- Lets you copy the transcription with one click

**How it works:** Next.js frontend (Vercel) → ngrok tunnel → FastAPI backend (local) → Whisper AI

---

## Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS |
| File Upload | react-dropzone |
| HTTP | Axios |
| Backend | Python 3.10+, FastAPI |
| AI Model | OpenAI Whisper (tiny) |
| Tunnel | ngrok |
| Hosting | Vercel |

---

## Requirements

You need these installed before starting:

| Tool | Version | Download |
|------|---------|---------|
| Python | 3.10+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| FFmpeg | Any | See below |
| ngrok | Any | [ngrok.com](https://ngrok.com/download) |

### Install FFmpeg

**Windows:**
```bash
winget install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt update && sudo apt install ffmpeg
```

---

## Setup Guide

### Step 1 - Clone the Repository

```bash
git clone https://github.com/Muinam/Audio-Transcription-app.git
cd Audio-Transcription-app
```

### Step 2 - Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

> Note: First time setup will download the Whisper model (~75MB). This takes a few minutes.

### Step 3 - Run the Backend

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
Loading Whisper tiny model...
Whisper model loaded successfully!
INFO: Uvicorn running on http://127.0.0.1:8000
```

Open `http://localhost:8000` in your browser to confirm it is running.

### Step 4 - Frontend Setup

```bash
cd frontend

npm install

# Windows:
copy .env.local.example .env.local
# Mac/Linux:
cp .env.local.example .env.local
```

Make sure `.env.local` has this:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 5 - Run Everything Together

```bash
cd frontend
npm run dev:all
```

This starts both backend and frontend at the same time.

Open `http://localhost:3000` and the app is ready!

---

## Deployment Guide

### 1 - Deploy Frontend to Vercel

Go to [vercel.com/new](https://vercel.com/new) and connect your GitHub repo.

Or use CLI:
```bash
cd frontend
npm install -g vercel
vercel
```

### 2 - Setup ngrok Account

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

Get your token from [ngrok.com/dashboard](https://dashboard.ngrok.com)

### 3 - Start ngrok Tunnel

```bash
ngrok http 8000
```

You will get a URL like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8000
```

Copy that URL.

### 4 - Add URL to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open your project → Settings → Environment Variables
3. Add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://abc123.ngrok-free.app`
4. Save and Redeploy

### 5 - Test

Open your Vercel URL, upload an audio file, and the transcription will appear!

---

## Project Structure

```
Audio-Transcription-app/
├── backend/
│   ├── main.py              # FastAPI server + Whisper AI
│   └── requirements.txt     # Python packages
│
├── frontend/
│   ├── pages/
│   │   ├── _app.tsx         # App entry point
│   │   └── index.tsx        # Main UI
│   ├── styles/
│   │   └── globals.css      # Styles and animations
│   ├── .env.local.example   # Environment variable template
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## API Endpoints

### GET /
Check if the server is running.

**Response:**
```json
{ "status": "running", "message": "Audio Transcription API is live" }
```

### POST /transcribe
Upload an audio file and get the transcription.

**Request:** multipart/form-data
- `file`: Audio file (.mp3, .wav, .m4a, .ogg, .flac) — max 25MB

**Success Response (200):**
```json
{
  "success": true,
  "transcription": "Your transcribed text here...",
  "language": "en",
  "filename": "audio.mp3",
  "file_size_kb": 1024.5
}
```

**Error Codes:**
- `400` — Wrong file type or empty file
- `413` — File is larger than 25MB
- `500` — Transcription failed

---

## Important Notes

- The ngrok URL changes every time you restart the tunnel — update Vercel each time
- Keep backend and ngrok running during review so the live site works
- First run is slow because Whisper model downloads automatically (~75MB)

---

## Common Problems

| Problem | Solution |
|---------|----------|
| FFmpeg not found | Install FFmpeg using winget or brew |
| CORS error | Check the ngrok URL is correct in Vercel settings |
| Connection refused | Make sure backend is running on port 8000 |
| Module not found | Run pip install -r requirements.txt again |
| ngrok ERR_NGROK_3200 | Free plan allows one tunnel only — close the old one |

---
