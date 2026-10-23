#!/usr/bin/env python3
"""Serve only this unpacked visual kit on loopback. No uploads or remote publishing."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import mimetypes

ROOT = Path(__file__).resolve().parent.parent
mimetypes.add_type('text/javascript', '.js')

class KitHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        target = Path(super().translate_path(path)).resolve()
        try:
            target.relative_to(ROOT)
        except ValueError:
            return str(ROOT / '__forbidden__')
        return str(target)

    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        # No URLs, query strings, or private credentials in the local access log.
        return

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8989)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(KitHandler, directory=str(ROOT)))
    print(f'9mew visual review: http://127.0.0.1:{args.port}/integration/review.html', flush=True)
    print('Press Ctrl+C to stop. Files are served locally only.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
