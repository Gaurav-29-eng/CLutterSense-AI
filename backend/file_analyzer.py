import os
import hashlib
from collections import defaultdict

# File type categories
FILE_CATEGORIES = {
    'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico'],
    'documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx'],
    'videos': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'],
    'audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma'],
    'archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
    'code': ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.php', '.rb', '.go', '.ts', '.jsx', '.tsx'],
    'executables': ['.exe', '.msi', '.app', '.dmg', '.deb', '.rpm'],
    'temp': ['.tmp', '.temp', '.cache', '.log', '.bak', '.swp'],
}

# Junk/temp file patterns
JUNK_PATTERNS = [
    '.tmp', '.temp', '.cache', '.log', '.bak', '.swp', '~', '.DS_Store', 'Thumbs.db'
]

def get_file_category(filename):
    """Categorize file based on extension"""
    ext = os.path.splitext(filename)[1].lower()
    for category, extensions in FILE_CATEGORIES.items():
        if ext in extensions:
            return category
    return 'other'

def is_junk_file(filename):
    """Check if file is a junk/temp file"""
    for pattern in JUNK_PATTERNS:
        if filename.endswith(pattern) or pattern in filename.lower():
            return True
    return False

def calculate_file_hash(filepath, chunk_size=8192):
    """Calculate MD5 hash of a file"""
    hasher = hashlib.md5()
    try:
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(chunk_size), b''):
                hasher.update(chunk)
        return hasher.hexdigest()
    except (IOError, OSError):
        return None

def analyze_folder(folder_path):
    """Analyze folder and return comprehensive results"""
    if not os.path.exists(folder_path):
        raise ValueError(f"Folder path does not exist: {folder_path}")
    
    if not os.path.isdir(folder_path):
        raise ValueError(f"Path is not a directory: {folder_path}")
    
    # Initialize data structures
    all_files = []
    file_hashes = defaultdict(list)
    categories = defaultdict(int)
    large_files = []
    junk_files = []
    total_size = 0
    
    # Walk through directory
    for root, dirs, files in os.walk(folder_path):
        for filename in files:
            filepath = os.path.join(root, filename)
            
            try:
                file_size = os.path.getsize(filepath)
                total_size += file_size
                
                # Categorize file
                category = get_file_category(filename)
                categories[category] += 1
                
                file_info = {
                    'path': filepath,
                    'name': filename,
                    'size': file_size,
                    'category': category
                }
                
                all_files.append(file_info)
                
                # Check for large files (>100MB)
                if file_size > 100 * 1024 * 1024:  # 100MB
                    large_files.append(file_info)
                
                # Check for junk files
                if is_junk_file(filename):
                    junk_files.append(file_info)
                
                # Calculate hash for duplicate detection (skip very large files)
                if file_size < 500 * 1024 * 1024:  # Skip files >500MB for hashing
                    file_hash = calculate_file_hash(filepath)
                    if file_hash:
                        file_hashes[file_hash].append(file_info)
                        
            except (OSError, PermissionError):
                continue
    
    # Find duplicates
    duplicates = []
    duplicate_size = 0
    for hash_val, files_list in file_hashes.items():
        if len(files_list) > 1:
            # Calculate wasted space (all but one copy)
            wasted_space = sum(f['size'] for f in files_list[1:])
            duplicate_size += wasted_space
            duplicates.append({
                'hash': hash_val[:16],  # Show first 16 chars
                'files': files_list,
                'size': files_list[0]['size'],
                'count': len(files_list)
            })
    
    # Calculate junk size
    junk_size = sum(f['size'] for f in junk_files)
    
    # Build summary
    summary = {
        'totalFiles': len(all_files),
        'totalSize': total_size,
        'duplicateCount': sum(d['count'] - 1 for d in duplicates),
        'duplicateSize': duplicate_size,
        'largeFileCount': len(large_files),
        'junkFileCount': len(junk_files),
        'junkSize': junk_size,
        'categories': dict(categories)
    }
    
    # Build scan data object
    scan_data = {
        'summary': summary,
        'duplicates': duplicates,
        'largeFiles': large_files,
        'junkFiles': junk_files
    }
    
    # Generate AI-like recommendations
    recommendations = generate_recommendations(scan_data)
    
    return {
        'summary': summary,
        'duplicates': duplicates,
        'largeFiles': large_files,
        'junkFiles': junk_files,
        'recommendations': recommendations
    }

def generate_recommendations(scan_data):
    """Generate AI-like recommendations based on scan data"""
    recommendations = []
    
    summary = scan_data.get('summary', {})
    duplicates = scan_data.get('duplicates', [])
    large_files = scan_data.get('largeFiles', [])
    junk_files = scan_data.get('junkFiles', [])
    
    # Rule: If duplicates > 0 → suggest removing duplicates
    if len(duplicates) > 0:
        duplicate_count = sum(d['count'] - 1 for d in duplicates)
        wasted_space = summary.get('duplicateSize', 0)
        recommendations.append(
            f"Found {len(duplicates)} groups of duplicate files ({duplicate_count} duplicate copies) "
            f"wasting {format_bytes(wasted_space)}. Remove duplicate copies to free up space."
        )
    
    # Rule: If junk files > 10 → suggest cleaning junk
    if len(junk_files) > 10:
        junk_size = summary.get('junkSize', 0)
        recommendations.append(
            f"Detected {len(junk_files)} junk/temp files occupying {format_bytes(junk_size)}. "
            f"Clean these files to reclaim disk space."
        )
    
    # Rule: If large files > 5 → suggest archiving large files
    if len(large_files) > 5:
        large_size = sum(f['size'] for f in large_files)
        recommendations.append(
            f"Found {len(large_files)} large files (>100MB) totaling {format_bytes(large_size)}. "
            f"Consider archiving rarely used large files to external storage."
        )
    
    # Rule: If storage usage > 80% → warn about low storage
    # Calculate storage usage percentage (assuming 1TB drive as baseline)
    total_size = summary.get('totalSize', 0)
    drive_capacity = 1 * 1024 * 1024 * 1024 * 1024  # 1TB baseline
    storage_percentage = (total_size / drive_capacity) * 100
    
    if storage_percentage > 80:
        recommendations.append(
            f"WARNING: Storage usage is at {storage_percentage:.1f}% of drive capacity. "
            f"Free up space immediately to prevent system issues."
        )
    
    # Add category-based insights
    categories = summary.get('categories', {})
    if categories.get('temp', 0) > 10:
        recommendations.append(
            f"High number of temporary files detected ({categories['temp']}). "
            f"Run disk cleanup to remove these files."
        )
    
    if not recommendations:
        recommendations.append(
            "Your folder looks well-organized! No major issues detected. "
            "Continue monitoring for duplicate files and temporary files."
        )
    
    return recommendations

def format_bytes(bytes):
    """Format bytes to human-readable format"""
    if bytes == 0:
        return '0 Bytes'
    k = 1024
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    i = int(bytes.bit_length() / 10)
    return f'{round(bytes / (k ** i), 2)} {sizes[i]}'
