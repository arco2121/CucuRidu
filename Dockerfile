# Usa una versione leggera di Node.js
FROM node:18-slim

# Crea la cartella dell'app
WORKDIR /app

# Copia i file dei pacchetti
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del codice
COPY . .

# ESPONI la porta corretta (7860 è obbligatoria su HF)
EXPOSE 7860

# Comando per avviare il sito
CMD [ "node", "app.js" ]
