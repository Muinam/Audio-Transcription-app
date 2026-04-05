import { useState, useCallback } from 'react'
import Head from 'next/head'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

type Status = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

interface TranscriptionResult {
  success: boolean
  transcription: string
  language: string
  filename: string
  file_size_kb: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function Waveform() {
  return (
    <div className="flex items-center gap-[3px] h-8">
      {[...Array(8)].map((_, i) => (
        <span key={i} className="wave-bar" />
      ))}
    </div>
  )
}

function getLangLabel(code: string) {
  const langs: Record<string, string> = {
    en: '🇬🇧 English', ur: '🇵🇰 Urdu', hi: '🇮🇳 Hindi',
    ar: '🇸🇦 Arabic', fr: '🇫🇷 French', de: '🇩🇪 German',
    zh: '🇨🇳 Chinese', es: '🇪🇸 Spanish', unknown: '🌐 Unknown',
  }
  return langs[code] || `🌐 ${code.toUpperCase()}`
}

function formatSize(kb: number) {
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<TranscriptionResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      setErrorMsg('Only audio files are accepted (.mp3, .wav, .m4a, .ogg, .flac)')
      setStatus('error')
      return
    }
    if (accepted.length > 0) {
      setFile(accepted[0])
      setStatus('idle')
      setResult(null)
      setErrorMsg('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac'] },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024,
  })

  const handleTranscribe = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(0)
    setResult(null)
    setErrorMsg('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      setProgress(20)
      await new Promise(r => setTimeout(r, 300))
      setStatus('processing')
      setProgress(50)
      const response = await axios.post<TranscriptionResult>(
        `${API_URL}/transcribe`, formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded / (e.total || 1)) * 40)
            setProgress(20 + pct)
          },
        }
      )
      setProgress(90)
      await new Promise(r => setTimeout(r, 400))
      setProgress(100)
      setResult(response.data)
      setStatus('done')
    } catch (err: any) {
      setStatus('error')
      const detail = err?.response?.data?.detail
      setErrorMsg(detail || 'Could not connect to server. Please check backend and ngrok.')
    }
  }

  const handleCopy = () => {
    if (result?.transcription) {
      navigator.clipboard.writeText(result.transcription)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleReset = () => {
    setFile(null)
    setStatus('idle')
    setResult(null)
    setErrorMsg('')
    setProgress(0)
  }

  return (
    <>
      <Head>
        <title>VoiceScript — AI Audio Transcription</title>
        <meta name="description" content="Upload any audio file and get instant text transcriptions using Whisper AI" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎙️</text></svg>" />
      </Head>

      <div className="bg-mesh" />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 py-16">

        <header className="text-center mb-14 fade-up fade-up-1">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🎙️</span>
            <h1 style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 50%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
            }}>
              VoiceScript
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', letterSpacing: '0.05em' }}>
            Upload your audio — AI will convert it to text instantly
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span style={{
              background: 'var(--accent-glow)',
              border: '1px solid var(--accent)',
              color: 'var(--accent-light)',
              fontSize: '0.7rem',
              padding: '2px 10px',
              borderRadius: '999px',
              letterSpacing: '0.1em',
              fontFamily: 'Space Mono, monospace'
            }}>
              POWERED BY WHISPER AI
            </span>
          </div>
        </header>

        <div className="w-full max-w-2xl fade-up fade-up-2">
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}>

            {/* Step 1 */}
            <div className="mb-6">
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', fontFamily: 'Space Mono, monospace' }}>
                STEP 01 — UPLOAD YOUR AUDIO FILE
              </label>
              <div
                {...getRootProps()}
                style={{
                  marginTop: '12px',
                  border: `2px dashed ${isDragActive ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border)'}`,
                  borderRadius: '14px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isDragActive ? 'rgba(124, 58, 237, 0.08)' : file ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎵</div>
                    <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '1rem' }}>{file.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                      {formatSize(file.size / 1024)} • Drag a new file to replace
                    </p>
                  </div>
                ) : isDragActive ? (
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📂</div>
                    <p style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Drop your file here!</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎙️</div>
                    <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '6px' }}>
                      Drag & drop your audio file or click to browse
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      .mp3 · .wav · .m4a · .ogg · .flac • Max 25MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-6">
              <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', fontFamily: 'Space Mono, monospace' }}>
                STEP 02 — START TRANSCRIPTION
              </label>
              <button
                onClick={handleTranscribe}
                disabled={!file || status === 'uploading' || status === 'processing'}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: !file || status === 'uploading' || status === 'processing' ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Mono, monospace',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease',
                  background: !file ? 'var(--border)' : status === 'uploading' || status === 'processing' ? 'var(--accent)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: !file ? 'var(--text-muted)' : 'white',
                  boxShadow: file && status === 'idle' ? '0 0 20px var(--accent-glow), 0 4px 15px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {status === 'uploading' && '📤 Uploading...'}
                {status === 'processing' && (
                  <span className="flex items-center justify-center gap-3">
                    <Waveform />
                    <span>AI is transcribing...</span>
                  </span>
                )}
                {(status === 'idle' || status === 'done' || status === 'error') && '🚀 Transcribe Now'}
              </button>

              {(status === 'uploading' || status === 'processing') && (
                <div style={{ marginTop: '10px', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                    borderRadius: '2px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              )}
            </div>

            {/* Error */}
            {status === 'error' && errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '16px',
                color: '#fca5a5',
                fontSize: '0.875rem',
              }}>
                {errorMsg}
              </div>
            )}

            {/* Step 3 - Result */}
            {status === 'done' && result && (
              <div className="fade-up">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', fontFamily: 'Space Mono, monospace' }}>
                  STEP 03 — TRANSCRIPTION RESULT
                </label>
                <div style={{ marginTop: '12px', marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { icon: '🌐', label: getLangLabel(result.language) },
                    { icon: '📁', label: result.filename },
                    { icon: '📏', label: formatSize(result.file_size_kb) },
                  ].map((tag, i) => (
                    <span key={i} style={{
                      background: 'rgba(124, 58, 237, 0.12)',
                      border: '1px solid rgba(124, 58, 237, 0.25)',
                      color: 'var(--accent-light)',
                      fontSize: '0.72rem',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontFamily: 'Space Mono, monospace',
                    }}>
                      {tag.icon} {tag.label}
                    </span>
                  ))}
                </div>
                <textarea
                  readOnly
                  value={result.transcription}
                  rows={6}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--accent)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                    lineHeight: '1.7',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'Syne, sans-serif',
                    boxShadow: '0 0 15px var(--accent-glow)',
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button onClick={handleCopy} style={{
                    flex: 1, padding: '11px', borderRadius: '10px',
                    border: '1px solid var(--accent)',
                    background: copied ? 'rgba(16,185,129,0.1)' : 'transparent',
                    color: copied ? 'var(--success)' : 'var(--accent-light)',
                    cursor: 'pointer', fontFamily: 'Space Mono, monospace',
                    fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s',
                  }}>
                    {copied ? '✅ Copied!' : '📋 Copy Text'}
                  </button>
                  <button onClick={handleReset} style={{
                    flex: 1, padding: '11px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    fontFamily: 'Space Mono, monospace', fontSize: '0.8rem',
                    fontWeight: 700, transition: 'all 0.2s',
                  }}>
                    🔄 New Audio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-10 text-center fade-up fade-up-4" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <p style={{ fontFamily: 'Space Mono, monospace' }}>
            Built with FastAPI + Whisper AI + Next.js
          </p>
        </footer>
      </main>
    </>
  )
}
