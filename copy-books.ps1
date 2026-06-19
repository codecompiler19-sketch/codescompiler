# Copy Books Library files to another CodesCompiler project folder
param (
    [string]$DestinationPath
)

if (-not $DestinationPath) {
    Write-Host "Error: Please provide the destination path." -ForegroundColor Red
    Write-Host "Example: .\copy-books.ps1 -DestinationPath 'C:\Users\Computer\Desktop\codescompiler.com\codescompiler - Copy\codescompiler'" -ForegroundColor Yellow
    exit
}

if (-not (Test-Path $DestinationPath)) {
    Write-Host "Error: Destination path does not exist: $DestinationPath" -ForegroundColor Red
    exit
}

# Files to copy
$files = @(
    "src/data/books.ts",
    "src/pages/books/index.astro",
    "src/pages/books/[slug].astro",
    "src/data/navigation.json"
)

# Folders to copy
$folders = @(
    "public/images/books",
    "public/downloads/books"
)

Write-Host "Syncing Books Library files to: $DestinationPath" -ForegroundColor Cyan

# Copy single files
foreach ($file in $files) {
    $srcFile = Join-Path $PSScriptRoot $file
    $destFile = Join-Path $DestinationPath $file
    $destDir = Split-Path $destFile -Parent
    
    if (Test-Path -LiteralPath $srcFile) {
        if (-not (Test-Path -LiteralPath $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item -LiteralPath $srcFile -Destination $destFile -Force
        Write-Host "[FILE] Copied: $file" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Source file not found: $file" -ForegroundColor Yellow
    }
}

# Copy folders
foreach ($folder in $folders) {
    $srcFolder = Join-Path $PSScriptRoot $folder
    $destFolder = Join-Path $DestinationPath $folder
    
    if (Test-Path -LiteralPath $srcFolder) {
        if (-not (Test-Path -LiteralPath $destFolder)) {
            New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
        }
        Copy-Item -LiteralPath $srcFolder -Destination $destFolder -Recurse -Force
        Write-Host "[DIR]  Copied: $folder" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Source folder not found: $folder" -ForegroundColor Yellow
    }
}

Write-Host "Sync completed successfully!" -ForegroundColor Green
