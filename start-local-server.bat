@echo off
title Asdos Digital Academy - Local Web Server
echo Menjalankan server lokal Asdos Digital Academy...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
