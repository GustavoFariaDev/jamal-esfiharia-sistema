# Configuração do Gunicorn para Render.com
import os
import multiprocessing

# Bind na porta fornecida pelo Render
# `or` pelo mesmo motivo do DATABASE_URL em app.py: PORT= vazio no .env faria
# o bind virar "0.0.0.0:" e o gunicorn nem subir.
bind = f"0.0.0.0:{os.getenv('PORT') or '5000'}"

# Workers (limitado para plano free do Render)
workers = min(multiprocessing.cpu_count() * 2 + 1, 4)
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 2

# Logging para stdout/stderr (Render captura automaticamente)
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "jamal_esfiharia"

# Server mechanics
daemon = False
preload_app = True
