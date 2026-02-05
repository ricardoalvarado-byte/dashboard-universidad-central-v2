@echo off
echo ========================================
echo  Subiendo cambios a GitHub...
echo ========================================
echo.

REM Ruta al ejecutable de Git
set GIT_PATH="C:\Users\ralvaradoa\AppData\Local\Programs\Git\cmd\git.exe"

REM Agregar todos los cambios
%GIT_PATH% add .

REM Pedir mensaje de commit
set /p commit_msg="Escribe una descripcion de los cambios (o presiona Enter para usar una por defecto): "
if "%commit_msg%"=="" set commit_msg="Actualizacion automatica del dashboard"

REM Hacer commit
%GIT_PATH% commit -m "%commit_msg%"

REM Subir a GitHub
echo.
echo Conectando con GitHub...
%GIT_PATH% push -u origin main

echo.
echo ========================================
echo  Proceso finalizado
echo ========================================
echo.
pause
