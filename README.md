# ClutterSense-AI

A full-stack application for analyzing and organizing file clutter. Scan folders to detect duplicates, large files, junk/temp files, and get AI-like recommendations for cleanup.

## Features

- **Folder Scanning**: Analyze any folder on your system
- **File Categorization**: Automatically categorize files by type (images, documents, videos, audio, archives, code, executables, temp)
- **Duplicate Detection**: Find duplicate files using MD5 hashing
- **Large File Detection**: Identify files larger than 100MB
- **Junk File Detection**: Detect temporary and junk files (.tmp, .cache, .log, etc.)
- **AI-like Recommendations**: Get smart recommendations based on analysis
- **Modern Dashboard**: Clean, responsive UI with real-time statistics

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls

### Backend
- Python Flask
- Flask-CORS for cross-origin requests

## Project Structure

```
ClutterSense-AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   └── FileScanner.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── backend/
    ├── app.py
    ├── file_analyzer.py
    └── requirements.txt
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn
- Gemini API Key (optional, for AI-powered recommendations)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Configure Gemini API (optional but recommended for AI recommendations):
```bash
cp .env.example .env
```
Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```
Get your API key from: https://makersuite.google.com/app/apikey

6. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

**Note:** Without a Gemini API key, the app will use rule-based recommendations instead of AI-powered suggestions.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`

2. Click "Scan Folder" to analyze a directory

3. Enter the folder path you want to analyze (e.g., `C:\Users\YourName\Downloads`)

4. Click "Start Scan" to begin the analysis

5. View the results on the Dashboard:
   - Summary statistics (total files, duplicates, large files, junk files)
   - Storage overview with size breakdown
   - Files by category
   - List of duplicate files
   - List of large files (>100MB)
   - List of junk/temp files
   - AI-like recommendations for cleanup

## API Endpoints

### POST /api/scan
Scan a folder and return analysis results.

**Request Body:**
```json
{
  "folderPath": "C:\\Users\\YourName\\Downloads"
}
```

**Response:**
```json
{
  "summary": {
    "totalFiles": 1234,
    "totalSize": 5368709120,
    "duplicateCount": 45,
    "duplicateSize": 104857600,
    "largeFileCount": 12,
    "junkFileCount": 67,
    "junkSize": 52428800,
    "categories": {
      "images": 234,
      "documents": 123,
      "videos": 45,
      ...
    }
  },
  "duplicates": [...],
  "largeFiles": [...],
  "junkFiles": [...],
  "recommendations": [...]
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## File Categories

The application categorizes files into the following types:
- **Images**: .jpg, .jpeg, .png, .gif, .bmp, .svg, .webp, .ico
- **Documents**: .pdf, .doc, .docx, .txt, .rtf, .odt, .xls, .xlsx, .ppt, .pptx
- **Videos**: .mp4, .avi, .mkv, .mov, .wmv, .flv, .webm
- **Audio**: .mp3, .wav, .flac, .aac, .ogg, .wma
- **Archives**: .zip, .rar, .7z, .tar, .gz, .bz2
- **Code**: .py, .js, .html, .css, .java, .cpp, .c, .php, .rb, .go, .ts, .jsx, .tsx
- **Executables**: .exe, .msi, .app, .dmg, .deb, .rpm
- **Temp**: .tmp, .temp, .cache, .log, .bak, .swp

## Junk File Detection

The application detects the following junk/temp file patterns:
- .tmp, .temp files
- .cache files
- .log files
- .bak files
- .swp files
- ~ (backup files)
- .DS_Store (macOS)
- Thumbs.db (Windows)

## Security Notes

- The backend only scans the specified folder and its subdirectories
- File hashing is skipped for files larger than 500MB to prevent memory issues
- The application does not modify or delete any files - it only analyzes them
- Always review recommendations before manually deleting files

## Development

### Building for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
The Flask app can be deployed using any WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Troubleshooting

### CORS Errors
If you encounter CORS errors, ensure Flask-CORS is installed and properly configured in `app.py`.

### Port Already in Use
If port 5000 or 5173 is already in use, you can change the ports:
- Backend: Modify the port in `backend/app.py`
- Frontend: Modify the port in `frontend/vite.config.js`

### Permission Errors
Some folders may require administrator privileges to scan. Run the terminal as administrator if you encounter permission errors.

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to submit issues and enhancement requests!
