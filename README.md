# 🎙️ YouTube Audio Dataset Creator

A powerful full-stack application to create high-quality audio datasets from YouTube videos. Perfect for speech recognition projects, model training, Kaggle competitions, and speech processing research.

## ✨ Features

- **🎥 YouTube Audio Extraction**: Download audio from any YouTube video
- **📝 Automatic Transcription**: Extract captions/subtitles directly from YouTube (no heavy AI processing needed!)
- **🌍 Multi-language Support**: French, English (US), Arabic, German, Japanese, Chinese, Spanish
- **✂️ Flexible Processing**:
  - Customizable trim duration (start and end)
  - Adjustable segment duration (minutes or seconds)
  - Saves as WAV files with organized naming
- **📊 Audio Quality Analysis**:
  - Background noise detection
  - Single speaker detection
  - Speech activity analysis
- **🎨 Modern UI**: Beautiful, responsive interface built with React + TypeScript + Tailwind CSS + Lucide Icons
- **📄 Automatic Script Generation**: Transcript/caption files automatically generated for each audio segment

## 📁 Project Structure

```
data-sets/
├── backend/
│   ├── main.py              # FastAPI server with all processing logic
│   ├── requirements.txt     # Python dependencies
│   └── temp/               # Temporary processing files (auto-created)
├── frontend/
│   ├── src/
│   │   ├── components/     # React components (AudioProcessor)
│   │   ├── services/       # API service layer
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── data/                   # Output directory (auto-created, gitignored)
│   ├── french/
│   │   └── script/        # Transcript files
│   ├── english/
│   │   └── script/
│   └── [other languages]...
├── .gitignore
├── README.md
└── QUICK_START.md
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.10-3.12** (Python 3.14+ not supported due to library compatibility)
- **Node.js 18+**
- **FFmpeg** (required for audio processing)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/youtube-audio-dataset-creator.git
cd youtube-audio-dataset-creator
```

### Step 2: Install FFmpeg

**Windows:**

```cmd
winget install FFmpeg
```

**macOS:**

```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install ffmpeg
```

Verify installation:

```bash
ffmpeg -version
```

### Step 3: Set up Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Set up Frontend

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## ▶️ Running the Application

### Start Backend (Terminal 1)

```bash
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Run the server
python main.py
```

**Backend will run on:** http://localhost:8000

### Start Frontend (Terminal 2)

```bash
cd frontend

# Start development server
npm run dev
```

**Frontend will run on:** http://localhost:5173

Open your browser and navigate to http://localhost:5173

## 📖 How to Use

1. **Open the application** in your browser: http://localhost:5173

2. **Fill in the form**:

   - 🎥 **YouTube URL**: Paste any YouTube video URL
   - 📝 **Title**: Enter a descriptive title (e.g., "french_lesson_1")
   - 🌍 **Language**: Select from 7 supported languages
   - 👤 **Gender**: Choose speaker gender (Men/Women)
   - ✂️ **Trim Settings**: Set seconds to remove from start and end (default: 20s each)
   - ⏱️ **Segment Duration**: Choose duration for each audio segment in minutes or seconds (default: 7 minutes)

3. **Quality Checklist** (manual verification):

   - ✓ Check "No background music or sound"
   - ✓ Check "Only one person speaking"

4. **Click "Process Audio"**

   - Watch the progress bar (0% → 100%)
   - Processing time: ~2-5 minutes for a 40-minute video

5. **Review Results**:
   - ✅ Audio quality analysis (automated checks)
   - 📊 Speech activity ratio
   - 📁 List of generated audio files
   - 📄 Automatic transcript files in `script/` folder

## 💡 Recommended Sources

**TED Talks** - Search YouTube for "TED [language]" to find:

- Single-speaker content
- High-quality audio
- Clear pronunciation
- Professional recording quality
- Available captions in multiple languages

## 📂 Output Format

All files are organized by language in the `data/` directory:

```
data/
├── english/
│   ├── ted_talk_climate_english_men_part1.wav
│   ├── ted_talk_climate_english_men_part2.wav
│   └── script/
│       ├── ted_talk_climate_english_men_part1.txt
│       └── ted_talk_climate_english_men_part2.txt
├── french/
│   ├── french_interview_1_french_women_part1.wav
│   └── script/
│       └── french_interview_1_french_women_part1.txt
└── [other languages]...
```

**Naming Convention:** `{title}_{language}_{gender}_part{N}.wav`

**Transcript Files:** Each audio segment has a corresponding `.txt` file with:

- Automatic transcription from YouTube captions
- Metadata (language, duration, source)
- Ready for manual editing if needed

## 🔍 Audio Quality Analysis

The application automatically analyzes each audio file:

- ✅ **Low Background Noise**: Checks average loudness (dBFS)
- 🗣️ **Single Speaker Detection**: Analyzes speech pattern consistency
- 📊 **Speech Activity Ratio**: Percentage of audio containing speech
- 🎯 **Overall Quality Score**: Combined metric (0-100%)

These metrics help you verify the audio quality before using it in your datasets.

## 🛠️ Technology Stack

### Backend (Python)

- **FastAPI** - Modern, fast web framework
- **yt-dlp** - YouTube audio downloading
- **pydub** - Audio manipulation and processing
- **youtube-transcript-api** - Extract captions/transcripts
- **FFmpeg** - Audio format conversion

### Frontend (React)

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client

## 🎯 Use Cases

This tool is perfect for:

- 📚 **Speech Recognition Research** - Create labeled datasets for training models
- 🤖 **Machine Learning Projects** - Generate audio data for Kaggle competitions
- 🗣️ **Language Learning Apps** - Build pronunciation and comprehension datasets
- 📊 **Audio Processing Research** - Study speech patterns across languages
- 🎓 **Academic Projects** - Create datasets for thesis or research papers
- 🔬 **NLP Applications** - Train audio-to-text or voice recognition systems

## 🔧 Customization

### Adjust Audio Processing

Edit `backend/main.py` to customize:

- Audio quality analysis thresholds
- Silence detection parameters
- Output format (WAV settings)

### Modify UI Theme

Edit `frontend/src/index.css` and Tailwind classes in components to customize colors and styling.

### Add More Languages

Update the `LANGUAGES` dictionary in `backend/main.py` and corresponding frontend mappings.

## 📝 Notes

- Ensure you have permission to download content from YouTube
- Processing time depends on video length and your internet speed
- Large files may take several minutes to process
- The application automatically creates language folders in the `data` directory

## 🐛 Troubleshooting

### Common Issues

**1. "Failed to download audio"**

- ✅ Verify YouTube URL is valid
- ✅ Check FFmpeg installation: `ffmpeg -version`
- ✅ Try a different video
- ✅ Check internet connection

**2. "No transcript found for this video"**

- ⚠️ Video doesn't have captions/subtitles
- 💡 Try TED Talks which always have transcripts
- 📝 Transcripts will have placeholder text to edit manually

**3. "Module not found" errors**

- ✅ Ensure virtual environment is activated
- ✅ Run `pip install -r requirements.txt` again
- ✅ Check Python version (3.10-3.12 required)

**4. Frontend can't connect to backend**

- ✅ Verify backend is running on http://localhost:8000
- ✅ Check CORS settings in `main.py`
- ✅ Restart both frontend and backend

**5. Python version compatibility**

- ⚠️ Python 3.14+ not supported due to `pydub` dependencies
- ✅ Use Python 3.10, 3.11, or 3.12

### Performance Tips

- Use videos under 1 hour for optimal processing speed
- TED Talks (10-20 minutes) are ideal
- Clear `backend/temp/` folder periodically
- Processing time: ~1-2 minutes per 10 minutes of video

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI** for inspiring AI-powered audio processing
- **TED** for providing high-quality educational content
- **FastAPI** & **React** communities for excellent frameworks
- **FFmpeg** for powerful audio processing capabilities

## 📬 Contact & Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/youtube-audio-dataset-creator/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/youtube-audio-dataset-creator/discussions)
- ⭐ **Star this repo** if you find it helpful!

---

**Built with ❤️ for the AI and speech processing community**

_Making dataset creation accessible to everyone!_ 🎉
