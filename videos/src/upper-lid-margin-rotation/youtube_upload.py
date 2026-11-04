"""Upload a teaching video to YouTube as UNLISTED via the YouTube Data API (resumable upload).

Credentials come only from environment variables (never from files in git):
  YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN
Usage:
  python3 youtube_upload.py VIDEO.mp4 --title "..." --desc-file desc.txt [--dry-run]
Prints the video ID on success. --dry-run checks the env vars and metadata without uploading.
"""
import argparse, json, os, sys, urllib.request, urllib.parse

def token():
    need = ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REFRESH_TOKEN']
    miss = [k for k in need if not os.environ.get(k)]
    if miss: sys.exit('missing env: ' + ', '.join(miss))
    body = urllib.parse.urlencode({'client_id': os.environ['YOUTUBE_CLIENT_ID'], 'client_secret': os.environ['YOUTUBE_CLIENT_SECRET'],
                                   'refresh_token': os.environ['YOUTUBE_REFRESH_TOKEN'], 'grant_type': 'refresh_token'}).encode()
    r = json.load(urllib.request.urlopen(urllib.request.Request('https://oauth2.googleapis.com/token', data=body)))
    return r['access_token']

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('--title', required=True); ap.add_argument('--desc-file', required=True)
    ap.add_argument('--dry-run', action='store_true'); a = ap.parse_args()
    meta = {'snippet': {'title': a.title, 'description': open(a.desc_file, encoding='utf-8').read(), 'categoryId': '27',
                        'defaultLanguage': 'zh-TW', 'defaultAudioLanguage': 'zh-TW'},
            'status': {'privacyStatus': 'unlisted', 'embeddable': True, 'selfDeclaredMadeForKids': False}}
    assert len(a.title) <= 100 and len(meta['snippet']['description'].encode()) <= 5000, 'YouTube title/description too long'
    size = os.path.getsize(a.video)
    if a.dry_run:
        print(json.dumps(meta, ensure_ascii=False, indent=1)); print('size', size)
        print('env ok' if all(os.environ.get(k) for k in ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REFRESH_TOKEN']) else 'env MISSING'); return
    at = token()
    init = urllib.request.Request('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        data=json.dumps(meta).encode(), method='POST', headers={'Authorization': 'Bearer ' + at, 'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': str(size)})
    loc = urllib.request.urlopen(init).headers['Location']
    with open(a.video, 'rb') as fh:
        up = urllib.request.Request(loc, data=fh.read(), method='PUT', headers={'Content-Type': 'video/mp4', 'Content-Length': str(size)})
        r = json.load(urllib.request.urlopen(up, timeout=1800))
    print(r['id']); print('privacy:', r.get('status', {}).get('privacyStatus'), file=sys.stderr)

if __name__ == '__main__':
    main()
