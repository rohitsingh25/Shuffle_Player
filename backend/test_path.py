import os
import django
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.conf import settings

base_dir = settings.BASE_DIR
print("BASE_DIR is:", base_dir)

music_dir = os.path.join(base_dir, 'music')
print("music_dir is:", music_dir)
print("Files in music_dir:", os.listdir(music_dir) if os.path.exists(music_dir) else "Directory does not exist!")
