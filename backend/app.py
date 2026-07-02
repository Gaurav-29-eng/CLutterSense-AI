from flask import Flask, request, jsonify
from flask_cors import CORS
from file_analyzer import analyze_folder

app = Flask(__name__)
CORS(app)

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
def scan_folder():
    try:
        data = request.json
        folder_path = data.get('folderPath')
        
        if not folder_path:
            return jsonify({'error': 'Folder path is required'}), 400
        
        results = analyze_folder(folder_path)
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
