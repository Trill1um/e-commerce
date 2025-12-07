@echo off
start cmd /c "cd /d %~dp0backend && npm install && npm run dev"
start cmd /c "cd /d %~dp0frontend && npm install && npm run dev"