#!/usr/bin/env python3
import os
import subprocess
import sys
import time
import threading

# ANSI color codes for our tags
COLORS = {
    "backend": "\033[94m",  # Blue
    "frontend": "\033[93m", # Yellow
    "reset": "\033[0m"
}

def check_env():
    if not os.path.exists(".venv"):
        print("virtual environment not found. Please run: python -m venv .venv")
        sys.exit(1)

def stream_logs(pipe, prefix):
    color = COLORS.get(prefix, "")
    reset = COLORS["reset"]
    # Read lines as they come in and prefix them
    for line in iter(pipe.readline, b''):
        decoded_line = line.decode('utf-8', errors='replace')
        # Only add prefix if the line actually has content
        if decoded_line.strip():
            sys.stdout.write(f"{color}[{prefix}]{reset} {decoded_line}")
        else:
            sys.stdout.write(decoded_line)
        sys.stdout.flush()

def run_process(name, cmd, cwd=None, env_vars=None):
    print(f"Starting {name}...")
    
    # Pass along system environment variables and add custom ones (like FORCE_COLOR)
    env = os.environ.copy()
    if env_vars:
        env.update(env_vars)
        
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    thread = threading.Thread(target=stream_logs, args=(proc.stdout, name))
    thread.daemon = True
    thread.start()
    return proc

def run_backend():
    cmd = [".venv/bin/uvicorn", "apps.api.main:app", "--reload", "--port", "8000", "--use-colors"]
    
    # Parse .gitignore and dynamically inject it into watchfiles
    if os.path.exists(".gitignore"):
        with open(".gitignore", "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    # Uvicorn/pathlib doesn't support absolute globs starting with /
                    if line.startswith("/"):
                        line = line[1:]
                    cmd.extend(["--reload-exclude", line])
                    
    return run_process("backend", cmd)

def run_frontend():
    if os.path.exists("apps/web"):
        # FORCE_COLOR=1 forces Vite/NPM to keep ANSI colors even when piped
        return run_process("frontend", ["npm", "run", "dev"], cwd="apps/web", env_vars={"FORCE_COLOR": "1"})
    else:
        print("Warning: apps/web directory not found, frontend will not be started.")
    return None

if __name__ == "__main__":
    check_env()
    
    backend_proc = run_backend()
    frontend_proc = run_frontend()
    
    try:
        # Keep the main script alive while subprocesses run
        if backend_proc: backend_proc.wait()
        if frontend_proc: frontend_proc.wait()
        else:
            while True: time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down...")
        if backend_proc: backend_proc.terminate()
        if frontend_proc: frontend_proc.terminate()