@echo off
setlocal

REM Check if Chrome is running
tasklist /FI "IMAGENAME eq chrome.exe" /NH | find /i "chrome.exe" > nul
if %ERRORLEVEL% EQU 0 (
    REM Chrome is running - ask user to quit
    echo Chrome is currently running.
    choice /C YN /M "Do you want to close Chrome before launching with unthrottled parameters?"
    
    if errorlevel 2 (
        echo Operation cancelled.
        goto :EOF
    )
    
    if errorlevel 1 (
        REM Attempt to close Chrome gracefully
        echo Closing Chrome...
        taskkill /F /IM chrome.exe
        
        REM Wait a moment for Chrome to fully terminate
        timeout /t 2 /nobreak > nul
        
        REM Make sure Chrome is fully closed
        :check_chrome_closed
        tasklist /FI "IMAGENAME eq chrome.exe" /NH | find /i "chrome.exe" > nul
        if %ERRORLEVEL% EQU 0 (
            echo Waiting for Chrome to fully close...
            timeout /t 1 /nobreak > nul
            goto check_chrome_closed
        )
    )
)

REM Launch Chrome with unthrottled parameters
echo Launching Chrome with unthrottled parameters...
start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --new-window --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding

echo Chrome launched successfully.
endlocal
