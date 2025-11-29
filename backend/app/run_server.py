import uvicorn
import time
import traceback
import os
import sys
from pathlib import Path
from dotenv import load_dotenv


def load_env():
    """
    Load .env for BOTH:
    - Normal Python run
    - PyInstaller EXE (inside _MEIPASS)
    """
    if hasattr(sys, "_MEIPASS"):
        env_path = Path(sys._MEIPASS) / ".env"
    else:
        env_path = Path(".env")

    if env_path.exists():
        load_dotenv(env_path)
        print(f"[INFO] Loaded environment from: {env_path}")
    else:
        print(f"[WARNING] No .env found at {env_path}")


def start_server():
    try:
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=False,
            log_level="info"
        )
    except Exception as e:
        print("\n=== SERVER CRASHED ===")
        print("Error:", e)
        print("Traceback:")
        traceback.print_exc()
        print("\nRestarting server in 3 seconds...\n")
        time.sleep(3)


if __name__ == "__main__":
    print("Starting backend server...")

    load_env()  # LOAD ALL ENV VARIABLES BEFORE SERVER STARTS

    # LOOP FOREVER – server will auto restart
    while True:
        start_server()
