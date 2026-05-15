@echo off
title E.O.M Dependency Installer
color 0A

echo ====================================================
echo      E.O.M - Dependency Installer for Windows
echo ====================================================
echo.

:: Check if Node.js/npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed or not in your PATH.
    echo Please download and install Node.js from https://nodejs.org/
    echo before running this installer.
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js and npm are installed.
echo [INFO] Installing required dependencies...
echo.

:: Run npm install
call npm install

if %ERRORLEVEL% equ 0 (
    echo.
    echo ====================================================
    echo [SUCCESS] Dependencies installed successfully!
    echo ====================================================
) else (
    echo.
    echo ====================================================
    echo [ERROR] An error occurred during installation.
    echo Please check the error messages above.
    echo ====================================================
)

echo.
pause
