import os
import sys
from pathlib import Path
from dotenv import load_dotenv


def load_env():
    """
    Loads the .env file whether the app is running normally or inside a PyInstaller EXE.
    """

    # If running as a PyInstaller bundle
    if hasattr(sys, "_MEIPASS"):
        # The .env file is inside the unpacked temp folder
        env_path = Path(sys._MEIPASS) / ".env"
    else:
        # Normal local run (project root)
        env_path = Path(".env")

    if env_path.exists():
        load_dotenv(env_path)
        print(f"[INFO] Loaded env file from: {env_path}")
        return True
    else:
        print(f"[WARNING] .env file not found at: {env_path}")
        return False
