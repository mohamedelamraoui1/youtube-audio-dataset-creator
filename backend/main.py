from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import os
from pathlib import Path
from pydub import AudioSegment
from pydub.silence import detect_nonsilent
from typing import List, Dict
import uuid
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
import re
import asyncio
from concurrent.futures import ThreadPoolExecutor

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base data directory
DATA_DIR = Path(__file__).parent.parent / "data"
TEMP_DIR = Path(__file__).parent / "temp"

# Load Whisper model (using base model for balance of speed and accuracy)
# Options: tiny, base, small, medium, large
WHISPER_MODEL = None

# Language mapping
LANGUAGES = {
    "french": "Français",
    "english": "English (US)",
    "arabic": "العربية",
    "german": "Deutsch",
    "japanese": "日本語",
    "chinese": "中文",
    "spanish": "Español"
}

class AudioRequest(BaseModel):
    url: str
    language: str
    title: str
    gender: str  # "men" or "women"
    quality_checked: bool = False
    trim_start: int = 20  # seconds to trim from start
    trim_end: int = 20  # seconds to trim from end
    segment_duration: float = 7  # minutes per segment
    video_id: str = ""  # YouTube video ID for transcript
    analyze_quality: bool = True  # Whether to perform audio quality analysis

class AudioResponse(BaseModel):
    success: bool
    message: str
    files: List[str] = []
    audio_checks: Dict = {}

def ensure_directories():
    """Create necessary directories"""
    DATA_DIR.mkdir(exist_ok=True)
    TEMP_DIR.mkdir(exist_ok=True)
    for lang in LANGUAGES.keys():
        (DATA_DIR / lang).mkdir(exist_ok=True)
        (DATA_DIR / lang / "script").mkdir(exist_ok=True)

def extract_video_id(url: str) -> str:
    """Extract YouTube video ID from URL - handles all formats (regular, playlist, shared, etc.)"""
    # Handle all possible YouTube URL formats
    patterns = [
        r'(?:youtube\.com\/watch\?v=)([^&\n?#]+)',  # Standard watch URL
        r'(?:youtu\.be\/)([^&\n?#\?]+)',  # Shortened URL
        r'(?:youtube\.com\/embed\/)([^&\n?#\?]+)',  # Embed URL
        r'(?:youtube\.com\/v\/)([^&\n?#\?]+)',  # Old embed format
        r'(?:youtube\.com\/shorts\/)([^&\n?#\?]+)',  # YouTube Shorts
        r'(?:youtube\.com\/watch\?.*[&?]v=)([^&\n?#]+)',  # Watch with other params
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            video_id = match.group(1)
            # Remove any remaining query parameters or fragments
            video_id = video_id.split('&')[0].split('?')[0].split('#')[0]
            print(f"[INFO] Extracted video ID: {video_id}")
            return video_id
    
    raise ValueError(f"Invalid YouTube URL format: {url}")

def get_youtube_transcript(video_id: str, language_code: str = None) -> str:
    """Fetch transcript from YouTube using youtube-transcript-api"""
    try:
        # Map our language codes to YouTube language codes
        lang_map = {
            "french": ["fr", "fr-FR"],
            "english": ["en", "en-US", "en-GB"],
            "arabic": ["ar", "ar-SA"],
            "german": ["de", "de-DE"],
            "japanese": ["ja", "ja-JP"],
            "chinese": ["zh", "zh-CN", "zh-TW"],
            "spanish": ["es", "es-ES", "es-MX"]
        }
        
        languages = lang_map.get(language_code, ["en"])
        
        # Try to get transcript in preferred language
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
        except:
            # Fallback to any available transcript
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Combine all text segments
        full_transcript = " ".join([entry['text'] for entry in transcript_list])
        return full_transcript.strip()
        
    except TranscriptsDisabled:
        return "# Transcripts are disabled for this video\n# Please add transcript manually"
    except NoTranscriptFound:
        return "# No transcript found for this video\n# Please add transcript manually"
    except Exception as e:
        return f"# Error fetching transcript: {str(e)}\n# Please add transcript manually"

def download_audio(url: str, output_path: str) -> tuple[str, str]:
    """Download audio from YouTube and return audio path + video ID"""
    print("[STEP 1/5] 🎥 Downloading audio from YouTube...")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
        }],
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,  # Important: don't download entire playlist, just the video
        'extract_flat': False,
    }
    
    try:
        # Extract video ID first
        video_id = extract_video_id(url)
        
        # Use video ID directly to avoid playlist issues
        direct_url = f"https://www.youtube.com/watch?v={video_id}"
        print(f"[INFO] Using direct video URL: {direct_url}")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([direct_url])
        
        print("[STEP 1/5] ✅ Audio downloaded successfully")
        return output_path + ".wav", video_id
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download audio: {str(e)}")

def analyze_audio_quality(audio_path: str) -> Dict:
    """Analyze audio for background noise and speech activity"""
    print("[STEP 2/5] 📊 Analyzing audio quality...")
    try:
        audio = AudioSegment.from_wav(audio_path)
        
        # 1. Check average loudness (dBFS)
        avg_loudness = audio.dBFS
        has_low_bg_noise = avg_loudness > -40  # Higher is better (less background noise)
        
        # 2. Check speech activity using silence detection
        nonsilent_ranges = detect_nonsilent(
            audio,
            min_silence_len=500,  # 500ms of silence
            silence_thresh=audio.dBFS - 16  # 16dB below average
        )
        
        speech_duration = sum(end - start for start, end in nonsilent_ranges)
        total_duration = len(audio)
        speech_ratio = speech_duration / total_duration if total_duration > 0 else 0
        
        # 3. Simplified quality check
        likely_single_speaker = speech_ratio > 0.5 and speech_ratio < 0.95
        
        print("[STEP 2/5] ✅ Audio quality analysis complete")
        return {
            "has_low_bg_noise": bool(has_low_bg_noise),
            "speech_ratio": float(speech_ratio),
            "likely_single_speaker": bool(likely_single_speaker),
            "avg_loudness_dbfs": float(avg_loudness),
            "quality_score": float((has_low_bg_noise * 0.5 + likely_single_speaker * 0.5))
        }
    except Exception as e:
        print(f"[STEP 2/5] ⚠️ Audio quality analysis failed: {str(e)}")
        return {
            "error": str(e),
            "has_low_bg_noise": None,
            "speech_ratio": None,
            "likely_single_speaker": None
        }

def trim_audio(audio_path: str, output_path: str, start_seconds: int = 20, end_seconds: int = 20):
    """Trim audio by removing first and last N seconds"""
    print(f"[STEP 3/5] ✂️ Trimming audio (removing {start_seconds}s from start, {end_seconds}s from end)...")
    audio = AudioSegment.from_wav(audio_path)
    
    # Convert seconds to milliseconds
    start_ms = start_seconds * 1000
    end_ms = end_seconds * 1000
    
    # Trim
    audio_trimmed = audio[start_ms:-end_ms if end_ms > 0 else None]
    
    # Save
    audio_trimmed.export(output_path, format="wav")
    print("[STEP 3/5] ✅ Audio trimmed successfully")
    return output_path

def split_transcript_by_time(full_transcript: str, segment_duration_minutes: float, total_audio_duration_ms: int) -> List[str]:
    """Split transcript into segments based on time"""
    # For now, split transcript evenly by length
    # This is a simple approximation
    total_duration_minutes = total_audio_duration_ms / 60000
    num_segments = int(total_duration_minutes / segment_duration_minutes) + 1
    
    if num_segments == 1:
        return [full_transcript]
    
    # Split by words to approximate time-based segments
    words = full_transcript.split()
    words_per_segment = len(words) // num_segments
    
    segments = []
    for i in range(num_segments):
        start_idx = i * words_per_segment
        end_idx = start_idx + words_per_segment if i < num_segments - 1 else len(words)
        segment_text = " ".join(words[start_idx:end_idx])
        segments.append(segment_text)
    
    return segments

def split_audio(audio_path: str, output_dir: Path, base_filename: str, language: str, video_id: str, segment_duration: float = 7.0):
    """Split audio into segments and create placeholder transcript files"""
    print(f"[STEP 4/5] 🔪 Splitting audio into {segment_duration}-minute segments...")
    audio = AudioSegment.from_wav(audio_path)
    
    # Convert minutes to milliseconds
    segment_ms = int(segment_duration * 60 * 1000)
    total_ms = len(audio)
    num_segments = (total_ms + segment_ms - 1) // segment_ms  # Calculate total segments
    
    print(f"[INFO] Total audio duration: {total_ms / 60000:.2f} minutes")
    print(f"[INFO] Will create {num_segments} segments")
    
    # Split into segments
    segment_files = []
    segment_num = 1
    
    for start_ms in range(0, total_ms, segment_ms):
        end_ms = min(start_ms + segment_ms, total_ms)
        segment = audio[start_ms:end_ms]
        
        # Save segment
        segment_filename = f"{base_filename}_part{segment_num}.wav"
        segment_path = output_dir / segment_filename
        segment.export(str(segment_path), format="wav")
        segment_files.append(segment_filename)
        print(f"[INFO] Created: {segment_filename}")
        
        # Create placeholder transcript file
        script_filename = f"{base_filename}_part{segment_num}.txt"
        script_path = output_dir / "script" / script_filename
        
        # Ensure script directory exists
        script_path.parent.mkdir(exist_ok=True)
        
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(f"# Transcript for {segment_filename}\n")
            f.write(f"# Language: {language}\n")
            f.write(f"# Duration: ~{segment_duration} minutes\n")
            f.write(f"# Source: YouTube Auto-Generated Captions\n")
            f.write(f"\n")
            f.write(f"# ⚠️ AUTOMATIC TRANSCRIPT FETCHING NOT YET DEVELOPED\n")
            f.write(f"# TODO: Add transcript manually or wait for future implementation\n")
            f.write(f"#\n")
            f.write(f"# This is a placeholder file. Please add the transcript content below:\n")
            f.write(f"\n")
            f.write(f"[Your transcript text here]\n")
        
        print(f"[INFO] Created placeholder transcript: script/{script_filename}")
        segment_num += 1
    
    print(f"[STEP 4/5] ✅ Split complete: {len(segment_files)} audio files + {len(segment_files)} transcript placeholders")
    return segment_files

@app.get("/")
def read_root():
    return {"message": "YouTube Audio Processor API", "status": "running"}

@app.get("/languages")
def get_languages():
    return {"languages": LANGUAGES}

@app.post("/process-audio", response_model=AudioResponse)
async def process_audio(request: AudioRequest):
    ensure_directories()
    
    try:
        print("\n" + "="*60)
        print("🚀 STARTING AUDIO PROCESSING")
        print("="*60)
        print(f"[INFO] Title: {request.title}")
        print(f"[INFO] Language: {request.language}")
        print(f"[INFO] URL: {request.url}")
        print("="*60 + "\n")
        
        # Generate unique ID for this processing job
        job_id = str(uuid.uuid4())[:8]
        
        # Download audio and get video ID
        temp_audio_path = str(TEMP_DIR / f"{job_id}_original")
        downloaded_file, video_id = download_audio(request.url, temp_audio_path)
        
        # Analyze audio quality only if requested
        if request.analyze_quality:
            audio_checks = analyze_audio_quality(downloaded_file)
        else:
            print("[STEP 2/5] ⏭️ Skipping audio quality analysis (disabled by user)")
            audio_checks = {
                "has_low_bg_noise": None,
                "speech_ratio": None,
                "likely_single_speaker": None,
                "avg_loudness_dbfs": None,
                "quality_score": None,
                "skipped": True
            }
        
        # Trim audio (remove first and last N seconds based on user input)
        trimmed_audio_path = str(TEMP_DIR / f"{job_id}_trimmed.wav")
        trim_audio(downloaded_file, trimmed_audio_path, request.trim_start, request.trim_end)
        
        # Prepare output directory and filename
        output_dir = DATA_DIR / request.language
        base_filename = f"{request.title}_{request.language}_{request.gender}"
        
        # Split audio into segments and create transcript placeholders
        segment_files = split_audio(
            trimmed_audio_path, 
            output_dir, 
            base_filename, 
            request.language,
            video_id,
            request.segment_duration
        )
        
        # Cleanup temp files
        print("[STEP 5/5] 🧹 Cleaning up temporary files...")
        try:
            os.remove(downloaded_file)
            os.remove(trimmed_audio_path)
            print("[STEP 5/5] ✅ Cleanup complete")
        except Exception as cleanup_error:
            print(f"[WARNING] Cleanup failed: {cleanup_error}")
        
        print("\n" + "="*60)
        print("✅ PROCESSING COMPLETE!")
        print(f"📁 Created {len(segment_files)} audio files in: data/{request.language}/")
        print(f"📄 Created {len(segment_files)} transcript placeholders in: data/{request.language}/script/")
        print("="*60 + "\n")
        
        return AudioResponse(
            success=True,
            message=f"Successfully processed audio into {len(segment_files)} segments",
            files=segment_files,
            audio_checks=audio_checks
        )
        
    except Exception as e:
        print("\n" + "="*60)
        print("❌ PROCESSING FAILED")
        print(f"Error: {str(e)}")
        print("="*60 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files/{language}")
def list_files(language: str):
    """List all files for a specific language"""
    if language not in LANGUAGES:
        raise HTTPException(status_code=400, detail="Invalid language")
    
    lang_dir = DATA_DIR / language
    if not lang_dir.exists():
        return {"files": []}
    
    files = [f.name for f in lang_dir.glob("*.wav")]
    return {"files": files}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
