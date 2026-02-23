@echo off
echo ====================================================
echo   SINCRONIZZAZIONE: HUGGING FACE -> LOCAL -> GITHUB
echo ====================================================

git remote add hf https://huggingface.co/spaces/arco2107/cucuridu
:: 1. Recupera le modifiche dal remote Hugging Face
echo [1/3] Scaricamento dati da Hugging Face...
git fetch hf

:: 2. Unisce le modifiche nel branch locale
echo [2/3] Unione modifiche (Merge)...
git merge hf/main --no-edit

:: 3. Invia tutto a GitHub
echo [3/3] Aggiornamento repository GitHub...
git push origin main

echo ====================================================
echo   OPERAZIONE COMPLETATA!
echo ====================================================
pause