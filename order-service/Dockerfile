# Order Service Dockerfile
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le répertoire pour la base de données
RUN mkdir -p /app/data

# Exposer le port gRPC
EXPOSE 50051

# Démarrer le service
CMD ["node", "src/index.js"]
