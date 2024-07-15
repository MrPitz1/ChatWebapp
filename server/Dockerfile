# Verwende das Node.js-Image in der LTS-Version
FROM node:lts

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere die package.json und package-lock.json in das Arbeitsverzeichnis
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install --quiet

# Kopiere den Rest des Anwendungscodes in das Arbeitsverzeichnis
COPY . .

# Exponiere den Port, auf dem die Anwendung läuft
EXPOSE 4000

# Starte die Anwendung
CMD ["node", "server.js"]
