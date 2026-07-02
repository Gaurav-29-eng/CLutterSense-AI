import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import Gemini, handle if not available
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
    
    # Configure Gemini API
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        genai.configure(api_key=api_key)
    else:
        GEMINI_AVAILABLE = False
except ImportError:
    GEMINI_AVAILABLE = False

def get_ai_recommendations(scan_results):
    """
    Generate AI-powered cleanup recommendations using Gemini API.
    
    Args:
        scan_results: Dictionary containing scan data (summary, duplicates, largeFiles, junkFiles)
    
    Returns:
        List of human-like cleanup suggestions
    """
    if not GEMINI_AVAILABLE:
        return [
            "Gemini API not available (Python version incompatibility or not installed).",
            "Using rule-based recommendations instead.",
            "Review duplicate files to free up space.",
            "Consider archiving large files to external storage.",
            "Clean up temporary and junk files."
        ]
    
    if not api_key:
        return [
            "Gemini API key not configured. Using rule-based recommendations instead.",
            "Please set GEMINI_API_KEY in your .env file to enable AI-powered recommendations."
        ]
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        # Build prompt with scan data
        summary = scan_results.get('summary', {})
        duplicates = scan_results.get('duplicates', [])
        large_files = scan_results.get('largeFiles', [])
        junk_files = scan_results.get('junkFiles', [])
        
        prompt = f"""
        You are an expert file management assistant. Analyze the following file scan results and provide 
        human-like, actionable cleanup recommendations.
        
        SCAN RESULTS:
        - Total Files: {summary.get('totalFiles', 0)}
        - Total Size: {format_bytes(summary.get('totalSize', 0))}
        - Duplicate Files: {summary.get('duplicateCount', 0)} ({format_bytes(summary.get('duplicateSize', 0))} wasted)
        - Large Files (>100MB): {summary.get('largeFileCount', 0)}
        - Junk/Temp Files: {summary.get('junkFileCount', 0)} ({format_bytes(summary.get('junkSize', 0))})
        
        File Categories:
        {format_categories(summary.get('categories', {}))}
        
        Please provide 3-5 specific, actionable recommendations for cleaning up this folder.
        Each recommendation should:
        1. Be specific to the data provided
        2. Suggest concrete actions
        3. Prioritize by impact (most space-saving first)
        4. Be written in a friendly, helpful tone
        5. Be concise (1-2 sentences each)
        
        Format each recommendation as a separate line starting with a dash (-).
        """
        
        response = model.generate_content(prompt)
        recommendations_text = response.text
        
        # Parse recommendations from response
        recommendations = []
        for line in recommendations_text.split('\n'):
            line = line.strip()
            if line.startswith('-'):
                recommendations.append(line[1:].strip())
            elif line and not line.startswith('-') and recommendations:
                # Append to previous recommendation if it's a continuation
                recommendations[-1] += ' ' + line
            elif line and not line.startswith('-'):
                recommendations.append(line)
        
        # Filter out empty recommendations
        recommendations = [r for r in recommendations if r and len(r) > 20]
        
        # Limit to 5 recommendations
        return recommendations[:5] if recommendations else [
            "Unable to generate AI recommendations. Using fallback analysis.",
            "Review duplicate files to free up space.",
            "Consider archiving large files to external storage.",
            "Clean up temporary and junk files."
        ]
        
    except Exception as e:
        return [
            f"AI recommendation generation failed: {str(e)}",
            "Using rule-based recommendations instead.",
            "Review duplicate files to free up space.",
            "Consider archiving large files to external storage.",
            "Clean up temporary and junk files."
        ]

def format_bytes(bytes):
    """Format bytes to human-readable format"""
    if bytes == 0:
        return '0 Bytes'
    k = 1024
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    i = int(bytes.bit_length() / 10)
    return f'{round(bytes / (k ** i), 2)} {sizes[i]}'

def format_categories(categories):
    """Format categories for prompt"""
    if not categories:
        return "No category data available"
    
    lines = []
    for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        lines.append(f"  - {category}: {count} files")
    return '\n'.join(lines)
