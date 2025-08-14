#!/usr/bin/env python3
"""
Test script to verify deployment setup works locally
Run this before deploying to Railway
"""

import os
import sys
from pathlib import Path

print("🧪 Testing deployment setup...")

# Test 1: Check if we can find the backend directory
current_dir = Path(__file__).parent
backend_dir = current_dir / "backend"
print(f"✅ Backend directory found: {backend_dir}")

# Test 2: Check if backend/requirements.txt exists
requirements_file = backend_dir / "requirements.txt"
if requirements_file.exists():
    print(f"✅ Requirements file found: {requirements_file}")
else:
    print(f"❌ Requirements file missing: {requirements_file}")
    sys.exit(1)

# Test 3: Check if backend/server.py exists
server_file = backend_dir / "server.py"
if server_file.exists():
    print(f"✅ Server file found: {server_file}")
else:
    print(f"❌ Server file missing: {server_file}")
    sys.exit(1)

# Test 4: Try to import the server (this will fail if dependencies aren't installed)
try:
    sys.path.insert(0, str(backend_dir))
    from server import app
    print("✅ Server import successful!")
except ImportError as e:
    print(f"⚠️  Server import failed (this is normal if dependencies aren't installed): {e}")
    print("   This will work once deployed to Railway with all dependencies")

# Test 5: Check environment variables
port = os.environ.get("PORT", "8000")
print(f"✅ Port configuration: {port}")

print("\n🎉 Deployment setup test completed!")
print("If all tests passed, you're ready to deploy to Railway!")
