# QUICK START GUIDE

## 🚀 Step-by-Step Setup (From Scratch)

### Step 1: Install FFmpeg

FFmpeg is required for audio processing.

**Windows:**

```cmd
winget install FFmpeg
```

Verify installation:

```cmd
ffmpeg -version
```

### Step 2: Install Backend Dependencies

```cmd
REM Navigate to backend directory
cd "c:\Users\dell\Documents\tp-traitement de parole\project\data-sets\backend"

REM Activate shared Python environment
D:\shared_python_env\Scripts\activate

REM Install all required packages
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies

Open a NEW terminal window:

```cmd
REM Navigate to frontend directory
cd "c:\Users\dell\Documents\tp-traitement de parole\project\data-sets\frontend"

REM Install Node.js dependencies
npm install
```

### Step 4: Start the Backend Server

In terminal 1:

```cmd
cd "c:\Users\dell\Documents\tp-traitement de parole\project\data-sets\backend"
D:\shared_python_env\Scripts\activate
python main.py
```

You should see:

```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 5: Start the Frontend

In terminal 2 (new window):

```cmd
cd "c:\Users\dell\Documents\tp-traitement de parole\project\data-sets\frontend"
npm run dev
```

You should see:

```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 6: Open the Application

Open your browser and go to: **http://localhost:5173**

---

## 📝 How to Use the Application

### Basic Workflow:

1. **Paste YouTube URL**

   - Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

2. **Enter a Title**

   - Use descriptive names like: `french_interview_1`
   - Avoid spaces (use underscores)

3. **Select Language**

   - Choose from: French, English (US), Arabic, German, Japanese, Chinese, Spanish

4. **Choose Gender**

   - Select: Men or Women

5. **Verify Quality** (Important!)

   - Before processing, manually check the video:
     - ✅ No background music
     - ✅ Only one person speaking
   - Check both boxes

6. **Click "Process Audio"**

   - Wait for processing (may take 1-5 minutes)
   - Backend will:
     - Download audio from YouTube
     - Trim first/last 20 seconds
     - Split into 7-minute segments
     - Analyze audio quality
     - Save files

7. **Review Results**
   - Check automated quality analysis
   - View list of generated files
   - Files are saved in `data/[language]/` folder

---

## 📂 Where Are My Files?

All audio files are saved in:

```
c:\Users\dell\Documents\tp-traitement de parole\project\data-sets\data\
```

Example structure:

```
data/
├── french/
│   ├── french_lesson_1_french_men_part1.wav
│   ├── french_lesson_1_french_men_part2.wav
│   └── french_lesson_1_french_men_part3.wav
├── english/
│   └── english_podcast_1_english_women_part1.wav
└── arabic/
    └── arabic_speech_1_arabic_men_part1.wav
```

---

## 🎯 Best Practices

### Finding Good YouTube Videos:

**For French:**

- Search: "french podcast", "interview français", "documentaire français"
- Look for: Single speaker, clear audio, 40min-1h duration

**For English (US):**

- Search: "american podcast", "TED talks", "american interview"
- Verify US accent (not British/Australian)

**For Arabic:**

- Search: "خطاب عربي", "مقابلة عربية", "بودكاست عربي"
- Use Modern Standard Arabic content

**For Other Languages:**

- Search: "[language] podcast", "[language] interview", "[language] speech"

### Quality Checklist:

✅ **Good Video:**

- One person speaking
- No background music
- Clear audio
- 40min-1h length
- Professional/podcast setting

❌ **Bad Video:**

- Multiple speakers (interviews, debates)
- Background music
- Crowd noise
- Too short (<30min)
- Poor audio quality

---

## 🔧 Troubleshooting

### Backend won't start

```cmd
REM Check if Python environment is activated
D:\shared_python_env\Scripts\activate

REM Reinstall dependencies
pip install -r requirements.txt

REM Check for errors
python main.py
```

### Frontend won't start

```cmd
REM Clear node modules and reinstall
rmdir /s /q node_modules
npm install

REM Start again
npm run dev
```

### "Failed to download audio"

- ✅ Check if URL is correct
- ✅ Verify FFmpeg is installed: `ffmpeg -version`
- ✅ Try a different video
- ✅ Check internet connection

### "Processing is slow"

- Normal for long videos (1h = 3-5 min processing)
- Don't close the browser during processing
- Check backend terminal for progress

---

## 💡 Tips & Tricks

1. **Process multiple videos in sequence**

   - Just fill the form again after one completes
   - No need to restart the application

2. **Organize your titles**

   - Use consistent naming: `[language]_[topic]_[number]`
   - Example: `french_news_1`, `french_news_2`, etc.

3. **Check audio quality analysis**

   - If quality score < 50%, consider finding a better video
   - Background noise detection helps verify audio quality

4. **Test with a short video first**
   - Try a 5-10 minute video to verify everything works
   - Then process longer videos (40min-1h)

---

## 📊 Expected Processing Times

| Video Length | Download | Processing | Total |
| ------------ | -------- | ---------- | ----- |
| 10 minutes   | 30s      | 30s        | ~1min |
| 40 minutes   | 1-2min   | 1-2min     | ~4min |
| 1 hour       | 2-3min   | 2-3min     | ~6min |

_Times vary based on internet speed and computer performance_

---

## 🆘 Need Help?

Check the terminal outputs:

- **Backend terminal**: Shows download progress, processing steps, errors
- **Frontend terminal**: Shows HTTP requests, connection issues

Common error messages and solutions are in the main README.md file.
