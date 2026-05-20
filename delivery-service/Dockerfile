# Delivery Service Dockerfile
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Exposer le port gRPC
EXPOSE 50052

# Démarrer le service
CMD ["node", "src/index.js"]
