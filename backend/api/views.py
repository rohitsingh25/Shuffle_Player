from django.http import JsonResponse, HttpResponseNotFound

def list_songs(request):
    """
    Returns an empty song list. The application operates in client-only mode 
    where the user browses and plays music files directly from their own system.
    """
    return JsonResponse([], safe=False)

def stream_audio(request):
    """
    Audio streaming endpoint is disabled as files are streamed directly 
    within the browser from the user's local directory handle.
    """
    return HttpResponseNotFound("Streaming endpoint is disabled in client-only mode.")
