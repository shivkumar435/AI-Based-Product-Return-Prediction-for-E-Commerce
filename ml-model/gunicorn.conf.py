"""
Gunicorn configuration for ReturnSense Flask ML Service on Render.
Automatically binds to 0.0.0.0:$PORT as required by Render.
"""

import os

# Render injects the PORT environment variable dynamically (default 10000 on Render)
port = os.environ.get("PORT", "5001")
bind = f"0.0.0.0:{port}"

# Concurrency & timeout settings optimized for Render free/starter tiers
workers = int(os.environ.get("WEB_CONCURRENCY", "2"))
threads = int(os.environ.get("PYTHON_GET_NUM_THREADS", "2"))
timeout = int(os.environ.get("GUNICORN_TIMEOUT", "120"))
keepalive = int(os.environ.get("GUNICORN_KEEPALIVE", "5"))

# Standard stdout/stderr logging
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("LOG_LEVEL", "info")
capture_output = True
