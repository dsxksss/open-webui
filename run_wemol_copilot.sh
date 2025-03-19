docker run -d --name wemol_copilot-1.1 -p 8040:8080 --gpus all \
-v /data/PRG/WeMolCopilot/:/app/backend/data \
-e OPENAI_API_BASE_URL='https://api.zhizengzeng.com/v1' \
-e OPENAI_API_KEY='sk-zk24ca892d6bba0d536c60457590a62889366ac4bfd88471' \
-e DEFAULT_USER_ROLE=user \
-e WEBUI_NAME='WeMol Copilot' \
wemol_copilot:1.1