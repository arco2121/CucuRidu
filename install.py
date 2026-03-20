import os
import subprocess
import shutil

REPO_URL = "https://github.com/arco2121/CucuRidu.git"
TARGET_DIR = "CucuRidu"

FILES_TO_DELETE = [
    "README_HF",
    "ignore",
    ".github",
    "install.py"
]

def run_command(command):
    try:
        subprocess.run(command, check=True, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"Errore durante l'esecuzione di: {command}\n{e}")

def main():
    print("CucuRidu installer\n\n")
    print(f"Sto clonando {REPO_URL}...")
    run_command(f"git clone {REPO_URL} {TARGET_DIR}")

    # 2. Pulizia
    os.chdir(TARGET_DIR)
    print("Inizio pulizia file...")

    for item in FILES_TO_DELETE:
        if os.path.exists(item):
            if os.path.isdir(item):
                shutil.rmtree(item)
                print(f"Cartella eliminata: {item}")
            else:
                os.remove(item)
                print(f"File eliminato: {item}")
        else:
            print(f"Saltato: {item} non trovato.")

    print("\nOperazione completata con successo!")

if __name__ == "__main__":
    main()