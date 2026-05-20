# Tracking Service Dockerfile
FROM node:18-slim

# Installer les dépendances de build
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Supprimer le node_modules s'il existe et réinstaller
RUN rm -rf node_modules package-lock.json && npm install --only=production

# Copier le code source
COPY . .

# Créer le répertoire pour la base de données
RUN mkdir -p /app/data

# Exposer le port gRPC
EXPOSE 50053

# Démarrer le service
CMD ["node", "src/index.js"]
