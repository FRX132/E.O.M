@echo off
title E.O.M Setup & Dependency Installer
color 0A

echo ====================================================
echo      E.O.M - Setup and Installer for Windows
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
echo.
echo Please choose an option:
echo [1] Clean Install (Delete existing node_modules and reinstall dependencies)
echo [2] Standard Install (Run npm install)
echo [3] Run E.O.M in Development Mode (npm run electron:dev)
echo [4] Build Windows Executable (npm run electron:build:win)
echo [5] Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto clean_install
if "%choice%"=="2" goto standard_install
if "%choice%"=="3" goto run_dev
if "%choice%"=="4" goto run_build
if "%choice%"=="5" goto end
goto invalid_choice

:clean_install
echo.
echo [INFO] Deleting existing node_modules...
if exist node_modules (
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del /f /q package-lock.json
)
echo [INFO] Installing required dependencies...
call npm install
goto post_install

:standard_install
echo.
echo [INFO] Installing required dependencies...
call npm install
goto post_install

:post_install
if %ERRORLEVEL% equ 0 (
    echo.
    echo ====================================================
    echo [SUCCESS] Dependencies installed successfully!
    echo ====================================================
    echo.
    echo Would you like to start E.O.M in development mode now? (Y/N)
    set /p start_choice=""
    if /i "%start_choice%"=="Y" goto run_dev
    goto end
) else (
    echo.
    echo ====================================================
    echo [ERROR] An error occurred during installation.
    echo Please check the error messages above.
    echo ====================================================
    pause
    exit /b 1
)

:run_dev
echo.
echo [INFO] Starting E.O.M in development mode...
call npm run electron:dev
goto end

:run_build
echo.
echo [INFO] Building E.O.M for Windows...
call npm run electron:build:win
goto end

:invalid_choice
echo.
echo [ERROR] Invalid choice. Exiting.
pause
exit /b 1

:end
echo.
echo Setup complete. Thank you!
pause
