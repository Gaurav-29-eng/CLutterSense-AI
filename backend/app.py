from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from file_analyzer import analyze_uploaded_files

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max upload size

@app.route('/')
def home():
    return jsonify({"message": "ClutterSense AI Backend Running"})

def get_ai_recommendations(data):
    """Local function to generate recommendations based on scan data"""
    recommendations = []

    if len(data.get("duplicates", [])) > 0:
        recommendations.append("Remove duplicate files to free storage.")

    if len(data.get("junkFiles", [])) > 0:
        recommendations.append("Delete junk files to improve performance.")

    if len(data.get("largeFiles", [])) > 0:
        recommendations.append("Consider archiving large files.")

    if not recommendations:
        recommendations.append("Your folder looks well-organized! No major issues detected.")

    return recommendations

@app.route('/api/scan', methods=['POST'])
def scan_files():
    try:
        # Check if files are present in the request
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        
        if not files or files[0].filename == '':
            return jsonify({'error': 'No files selected'}), 400
        
        # Save uploaded files and analyze them
        uploaded_file_paths = []
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                uploaded_file_paths.append(filepath)
        
        # Analyze the uploaded files
        results = analyze_uploaded_files(uploaded_file_paths)
        
        # Clean up uploaded files after analysis
        for filepath in uploaded_file_paths:
            try:
                if os.path.exists(filepath):
                    os.remove(filepath)
            except:
                pass
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get recommendations using local function"""
    try:
        data = request.json
        scan_results = data.get('scanResults')
        
        if not scan_results:
            return jsonify({'error': 'Scan results are required'}), 400
        
        recommendations = get_ai_recommendations(scan_results)
        return jsonify({'recommendations': recommendations})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
