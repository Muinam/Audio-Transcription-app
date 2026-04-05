import os
import tempfile
import whisper
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ─── App Setup ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Audio Transcription API",
    description="Upload audio files and get text transcriptions using Whisper AI",
    version="1.0.0"
)

# ─── CORS — Frontend ko allow karo ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Production mein apna Vercel URL daalna
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Whisper Model Load ──────────────────────────────────────────────────────
print("Loading Whisper tiny model...")
model = whisper.load_model("tiny")
print("Whisper model loaded successfully!")

# ─── Allowed File Types ──────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".mp4", ".webm"}
MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


# ─── Health Check ────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "running", "message": "Audio Transcription API is live 🎙️"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "model": "whisper-tiny"}


# ─── Main Transcription Endpoint ─────────────────────────────────────────────
@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Audio file upload karo aur text transcription wapas pao.
    Supported: .mp3, .wav, .m4a, .ogg, .flac, .mp4, .webm
    Max size: 25MB
    """

    # 1. File extension check
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' allowed nahi hai. Yeh types use karo: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. File content read karo
    contents = await file.read()

    # 3. File size check
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File size {MAX_FILE_SIZE_MB}MB se zyada hai. Chhoti file upload karo."
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=400,
            detail="File empty hai. Dobara try karo."
        )

    # 4. Temp file mein save karo aur Whisper se transcribe karo
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        print(f"Transcribing: {filename} ({len(contents) / 1024:.1f} KB)")

        # Whisper transcription
        result = model.transcribe(tmp_path)
        transcription = result["text"].strip()
        language = result.get("language", "unknown")

        print(f"Done! Language: {language}, Text: {transcription[:80]}...")

        return JSONResponse(content={
            "success": True,
            "transcription": transcription,
            "language": language,
            "filename": filename,
            "file_size_kb": round(len(contents) / 1024, 2)
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Transcription mein error aya: {str(e)}"
        )

    finally:
        # Temp file delete karo
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
