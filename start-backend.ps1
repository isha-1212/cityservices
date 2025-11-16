# Start the Flask backend server
Write-Host "Starting CityServices AI Backend..." -ForegroundColor Green
Write-Host ""

# Navigate to AI directory
Set-Location -Path "$PSScriptRoot\AI"

# Check if virtual environment exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "No virtual environment found. Installing dependencies globally..." -ForegroundColor Yellow
}

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
python -m pip install -r requirements.txt --quiet

Write-Host ""
Write-Host "Starting Flask server on http://localhost:8000..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

# Start the server
python server.py
