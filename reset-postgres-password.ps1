# PostgreSQL Password Reset Script
# Run this script as Administrator

Write-Host "=== PostgreSQL Password Reset Tool ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Configuration
$pgPath = "C:\Program Files\PostgreSQL\18"
$pgDataPath = "$pgPath\data"
$pgHbaFile = "$pgDataPath\pg_hba.conf"
$pgHbaBackup = "$pgDataPath\pg_hba.conf.backup"
$psqlExe = "$pgPath\bin\psql.exe"
$serviceName = "postgresql-x64-18"

# Verify PostgreSQL installation
if (-not (Test-Path $pgHbaFile)) {
    Write-Host "ERROR: PostgreSQL configuration file not found at: $pgHbaFile" -ForegroundColor Red
    Write-Host "Please verify your PostgreSQL installation path." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Found PostgreSQL installation at: $pgPath" -ForegroundColor Green
Write-Host ""

# Get new password
$newPassword = Read-Host "Enter new password for postgres user" -AsSecureString
$newPasswordConfirm = Read-Host "Confirm new password" -AsSecureString

$pwd1 = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($newPassword))
$pwd2 = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($newPasswordConfirm))

if ($pwd1 -ne $pwd2) {
    Write-Host "ERROR: Passwords do not match!" -ForegroundColor Red
    pause
    exit 1
}

if ($pwd1.Length -lt 6) {
    Write-Host "ERROR: Password must be at least 6 characters long!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Step 1: Backing up pg_hba.conf..." -ForegroundColor Yellow
Copy-Item $pgHbaFile $pgHbaBackup -Force
Write-Host "✓ Backup created: $pgHbaBackup" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Modifying pg_hba.conf to allow passwordless access..." -ForegroundColor Yellow
$content = Get-Content $pgHbaFile
$modifiedContent = $content -replace 'scram-sha-256', 'trust' -replace 'md5', 'trust'
$modifiedContent | Set-Content $pgHbaFile
Write-Host "✓ Configuration modified" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Restarting PostgreSQL service..." -ForegroundColor Yellow
try {
    Restart-Service $serviceName -Force -ErrorAction Stop
    Start-Sleep -Seconds 3
    Write-Host "✓ PostgreSQL service restarted" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to restart PostgreSQL service: $_" -ForegroundColor Red
    Write-Host "Restoring backup..." -ForegroundColor Yellow
    Copy-Item $pgHbaBackup $pgHbaFile -Force
    pause
    exit 1
}

Write-Host ""
Write-Host "Step 4: Changing postgres user password..." -ForegroundColor Yellow
try {
    $sqlCommand = "ALTER USER postgres WITH PASSWORD '$pwd1';"
    & $psqlExe -U postgres -c $sqlCommand 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Password changed successfully!" -ForegroundColor Green
    } else {
        throw "psql command failed"
    }
} catch {
    Write-Host "ERROR: Failed to change password: $_" -ForegroundColor Red
    Write-Host "Restoring backup..." -ForegroundColor Yellow
    Copy-Item $pgHbaBackup $pgHbaFile -Force
    Restart-Service $serviceName -Force
    pause
    exit 1
}

Write-Host ""
Write-Host "Step 5: Restoring pg_hba.conf security settings..." -ForegroundColor Yellow
Copy-Item $pgHbaBackup $pgHbaFile -Force
Write-Host "✓ Security settings restored" -ForegroundColor Green

Write-Host ""
Write-Host "Step 6: Restarting PostgreSQL service with secure settings..." -ForegroundColor Yellow
Restart-Service $serviceName -Force
Start-Sleep -Seconds 3
Write-Host "✓ PostgreSQL service restarted" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUCCESS! Password has been reset!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your new PostgreSQL connection details:" -ForegroundColor Yellow
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  User: postgres" -ForegroundColor White
Write-Host "  Password: (the password you just set)" -ForegroundColor White
Write-Host ""
Write-Host "Connection string for .env file:" -ForegroundColor Yellow
Write-Host "DATABASE_URL=postgresql://postgres:$pwd1@localhost:5432/arc_wallet" -ForegroundColor Cyan
Write-Host ""

# Clean up sensitive variables
$pwd1 = $null
$pwd2 = $null
$newPassword = $null
$newPasswordConfirm = $null

Write-Host "Backup file kept at: $pgHbaBackup" -ForegroundColor Gray
Write-Host ""
pause
