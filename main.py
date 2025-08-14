#!/usr/bin/env python3
"""
Main entry point for Railway deployment
This file helps Railway detect this as a Python project
"""

import os
import sys
from pathlib import Path

# Get the current directory
current_dir = Path(__file__).parent

# Add backend to Python path
backend_dir = current_dir / "backend"
sys.path.insert(0, str(backend_dir))

# Change working directory to backend for relative imports
os.chdir(backend_dir)

try:
    # Import and run the FastAPI app
    from server import app
    
    if __name__ == "__main__":
        import uvicorn
        port = int(os.environ.get("PORT", 8000))
        print(f"🚀 Starting FastAPI server on port {port}")
        print(f"📁 Working directory: {os.getcwd()}")
        print(f"🐍 Python path: {sys.path[:3]}...")  # Show first 3 paths
        uvicorn.run(app, host="0.0.0.0", port=port)
        
except ImportError as e:
    print(f"❌ Error importing server: {e}")
    print(f"📁 Current working directory: {os.getcwd()}")
    print(f"🐍 Python path: {sys.path}")
    print(f"📦 Checking if requirements are installed...")
    
    # Try to install requirements if they're missing
    try:
        import subprocess
        print("📦 Installing requirements...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "../requirements.txt"], check=True)
        print("✅ Requirements installed successfully!")
        
        # Try importing again
        from server import app
        print("✅ Server import successful after installing requirements!")
        
        if __name__ == "__main__":
            import uvicorn
            port = int(os.environ.get("PORT", 8000))
            uvicorn.run(app, host="0.0.0.0", port=port)
            
    except Exception as install_error:
        print(f"❌ Failed to install requirements: {install_error}")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)
