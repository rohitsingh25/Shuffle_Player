import os
from pathlib import Path
from django.http import JsonResponse, StreamingHttpResponse, HttpResponseNotFound
from django.conf import settings
import urllib.parse

def get_audio_files():
    # Only scan the local 'music' directory
    # BASE_DIR is backend/, so music/ is just os.path.join(settings.BASE_DIR, 'music')
    directories_to_scan = [
        os.path.join(settings.BASE_DIR, 'music'),
    ]
    
    files = []
    for directory in directories_to_scan:
        if os.path.exists(directory):
            try:
                for file in os.listdir(directory):
                    file_path = os.path.join(directory, file)
                    if os.path.isfile(file_path) and file.lower().endswith('.mp3'):
                        files.append(file_path)
            except Exception as e:
                print(f"Error reading {directory}: {e}")
                
    # Deduplicate
    return list(set(files))

def list_songs(request):
    files = get_audio_files()
    
    songs = []
    # Hardcode port 5000 to match original Node.js config expectation or request host
    host = request.get_host()
    
    for i, file_path in enumerate(files):
        file_name = os.path.basename(file_path)
        print(f"DEBUG: Processing file: {file_name}")
        encoded_path = urllib.parse.quote(file_path)
        songs.append({
            'id': i + 1,
            'title': file_name[:-4] if file_name.lower().endswith('.mp3') else file_name,
            'filename': file_name,
            'url': f"http://{host}/api/stream/?path={encoded_path}"
        })
        
    return JsonResponse(songs, safe=False)

def stream_audio(request):
    file_path = request.GET.get('path')
    
    if not file_path or not os.path.exists(file_path):
        return HttpResponseNotFound("File not found")
        
    file_size = os.path.getsize(file_path)
    range_header = request.META.get('HTTP_RANGE', '').strip()
    
    if range_header:
        range_match = range_header.replace('bytes=', '').split('-')
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if len(range_match) > 1 and range_match[1] else file_size - 1
        
        length = end - start + 1
        
        def file_iterator(file_path, start, length, chunk_size=8192):
            with open(file_path, 'rb') as f:
                f.seek(start)
                remaining = length
                while remaining > 0:
                    chunk = f.read(min(chunk_size, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk
                    
        response = StreamingHttpResponse(file_iterator(file_path, start, length), status=206, content_type='audio/mpeg')
        response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
        response['Accept-Ranges'] = 'bytes'
        response['Content-Length'] = str(length)
        return response
    else:
        def file_iterator(file_path, chunk_size=8192):
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    yield chunk
                    
        response = StreamingHttpResponse(file_iterator(file_path), content_type='audio/mpeg')
        response['Content-Length'] = str(file_size)
        return response
