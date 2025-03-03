PORT="${PORT:-8080}"
export HF_ENDPOINT=https://hf-mirror.com && uvicorn open_webui.main:app --port $PORT --host 0.0.0.0 --forwarded-allow-ips '*' --reload