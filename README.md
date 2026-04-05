# 🎙️ VoiceScript — AI Audio Transcription App

> Upload any audio file and get accurate text transcriptions in seconds, powered by OpenAI's Whisper AI model.

![Tech Stack](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Whisper](https://img.shields.io/badge/Whisper-tiny-412991?style=flat-square&logo=openai)
![Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

---

## 📋 Project Overview

VoiceScript is a full-stack web application that allows users to:
- Upload audio files (.mp3, .wav, .m4a, .ogg, .flac)
- Get real-time AI-powered text transcriptions via Whisper tiny model
- Copy transcription text to clipboard
- Supports multiple languages (auto-detected)

**Architecture:** React/Next.js frontend (Vercel) ↔ ngrok tunnel ↔ FastAPI backend (local) ↔ Whisper AI model

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Custom CSS animations |
| File Upload | react-dropzone |
| HTTP Client | Axios |
| Backend | Python 3.10+, FastAPI |
| AI Model | OpenAI Whisper (tiny) |
| Tunneling | ngrok |
| Deployment | Vercel (frontend) |

---

## ✅ Prerequisites

Make sure these are installed on your machine:

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.10+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Comes with Node.js |
| FFmpeg | Any | See below |
| ngrok | Any | [ngrok.com](https://ngrok.com/download) |

### Install FFmpeg

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install ffmpeg
```

---

## 🚀 Setup Instructions

### Step 1 — Repository Clone Karo

```bash
git clone https://github.com/YOUR_USERNAME/audio-transcription-app.git
cd audio-transcription-app
```

### Step 2 — Backend Setup

```bash
# Backend folder mein jao
cd backend

# Virtual environment banao (recommended)
python -m venv venv

# Virtual environment activate karo
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Dependencies install karo
pip install -r requirements.txt
```

> ⏳ **Note:** Pehli baar `openai-whisper` install hoga aur model download hoga (~75MB). Patience rakho.

### Step 3 — Backend Run Karo

```bash
# backend/ folder mein (venv active hona chahiye)
uvicorn main:app --reload --port 8000
```

Aapko yeh dikhega:
```
⏳ Loading Whisper tiny model...
✅ Whisper model loaded successfully!
INFO: Uvicorn running on http://127.0.0.1:8000
```

**Test karo:** Browser mein `http://localhost:8000` open karo — `{"status":"running"}` dikhna chahiye.

### Step 4 — Frontend Setup

```bash
# Nayi terminal mein — frontend folder mein jao
cd frontend

# Dependencies install karo
npm install

# .env.local file banao
cp .env.local.example .env.local
```

`.env.local` file mein yeh hona chahiye (local testing ke liye):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 5 — Frontend Run Karo

```bash
# frontend/ folder mein
npm run dev
```

Browser mein `http://localhost:3000` open karo — app ready hai! 🎉

---

## 🌐 Deployment Instructions

### Step 1 — Frontend Vercel par Deploy Karo

```bash
# Vercel CLI install karo (agar nahi hai)
npm install -g vercel

# frontend/ folder mein
cd frontend

# Deploy karo
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: audio-transcription-app
# - Root directory: ./
```

Ya GitHub se directly: [vercel.com/new](https://vercel.com/new) → GitHub repo connect karo.

### Step 2 — ngrok Setup Karo

```bash
# ngrok account banao: https://ngrok.com
# Auth token set karo (ek baar)
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

### Step 3 — ngrok Tunnel Start Karo

```bash
# Ek nayi terminal mein (backend chal raha ho)
ngrok http 8000
```

Aapko yeh dikhega:
```
Forwarding  https://abc123def.ngrok-free.app -> http://localhost:8000
```

**Yeh URL copy karo:** `https://abc123def.ngrok-free.app`

### Step 4 — Vercel Environment Variable Update Karo

1. [vercel.com/dashboard](https://vercel.com/dashboard) → Apna project open karo
2. **Settings** → **Environment Variables**
3. Variable add karo:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://abc123def.ngrok-free.app` (apna ngrok URL)
4. **Save** karo
5. **Redeploy:** Deployments → Latest deployment → **Redeploy**

### Step 5 — Test Karo

Live Vercel URL open karo aur audio upload karo — transcription aani chahiye! ✅

---

## 📁 Project Structure

```
audio-transcription-app/
├── backend/
│   ├── main.py              # FastAPI server + Whisper integration
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── pages/
│   │   ├── _app.tsx         # Next.js App wrapper
│   │   └── index.tsx        # Main UI page
│   ├── styles/
│   │   └── globals.css      # Global styles + animations
│   ├── .env.local.example   # Environment variables template
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## 🔌 API Reference

### `GET /`
Health check — server running hai ya nahi

**Response:**
```json
{ "status": "running", "message": "Audio Transcription API is live 🎙️" }
```

### `POST /transcribe`
Audio file upload karo aur transcription pao

**Request:** `multipart/form-data`
- `file`: Audio file (.mp3, .wav, .m4a, .ogg, .flac) — max 25MB

**Success Response (200):**
```json
{
  "success": true,
  "transcription": "Yeh transcribed text hai...",
  "language": "en",
  "filename": "audio.mp3",
  "file_size_kb": 1024.5
}
```

**Error Responses:**
- `400` — Invalid file type ya empty file
- `413` — File 25MB se badi hai
- `500` — Transcription processing error

---

## ⚠️ Important Notes

1. **ngrok URL changes** har baar jab aap tunnel restart karte ho — Vercel mein dobara update karna hoga
2. **Review ke time** backend aur ngrok dono chalu rakhna — warna live site kaam nahi karega
3. **First run slow** ho sakta hai — Whisper model pehli baar download hota hai

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `FFmpeg not found` | FFmpeg install karo (upar instructions dekho) |
| `CORS error` | Backend mein CORS already enabled hai — ngrok URL sahi hai? |
| `Connection refused` | Backend port 8000 par chal raha hai? ngrok active hai? |
| `Module not found` | `pip install -r requirements.txt` dobara run karo |
| ngrok `ERR_NGROK_3200` | Free account mein ek hi tunnel allowed — purana band karo |

---

## 👨‍💻 Author

Built as a Full-Stack AI Challenge submission.
