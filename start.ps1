# start.ps1 — starts the full Content Agent Dashboard
Set-Location "$HOME\content-agent"
Write-Host "Starting Content Agent Dashboard..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$HOME\content-agent'; node scripts\agent-server.js"
Start-Sleep -Seconds 2
Write-Host "Agent server started on port 3001" -ForegroundColor Green
Write-Host "Starting dashboard on port 3000..." -ForegroundColor Cyan
serve dashboard