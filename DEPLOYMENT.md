# 🚀 Guide de Déploiement

Ce guide explique comment déployer le système de livraison en production.

---

## 📋 Table des matières

1. [Déploiement avec Docker](#déploiement-avec-docker)
2. [Déploiement sur Cloud](#déploiement-sur-cloud)
3. [Configuration Production](#configuration-production)
4. [Monitoring](#monitoring)
5. [Sécurité](#sécurité)
6. [Backup](#backup)

---

## 🐳 Déploiement avec Docker

### 1. Build des images

```bash
# Build toutes les images
docker-compose -f docker-compose.full.yml build

# Ou individuellement
docker build -t order-service:latest ./order-service
docker build -t delivery-service:latest ./delivery-service
docker build -t tracking-service:latest ./tracking-service
docker build -t api-gateway:latest ./api-gateway
```

### 2. Démarrage

```bash
# Démarrer tous les services
docker-compose -f docker-compose.full.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.full.yml logs -f

# Vérifier le statut
docker-compose -f docker-compose.full.yml ps
```

### 3. Créer les topics Kafka

```bash
docker exec -it kafka bash

# Créer les topics
kafka-topics --create --topic order.created --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic delivery.assigned --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic delivery.status.changed --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic tracking.updated --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

exit
```

### 4. Vérification

```bash
# Tester l'API Gateway
curl http://localhost:3000/api/orders

# Tester GraphQL
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ availableDrivers { name } }"}'
```

### 5. Arrêt

```bash
# Arrêter tous les services
docker-compose -f docker-compose.full.yml down

# Arrêter et supprimer les volumes
docker-compose -f docker-compose.full.yml down -v
```

---

## ☁️ Déploiement sur Cloud

### AWS (Amazon Web Services)

#### Option 1: ECS (Elastic Container Service)

1. **Créer un repository ECR pour chaque service:**
```bash
aws ecr create-repository --repository-name order-service
aws ecr create-repository --repository-name delivery-service
aws ecr create-repository --repository-name tracking-service
aws ecr create-repository --repository-name api-gateway
```

2. **Push des images:**
```bash
# Login ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-west-1.amazonaws.com

# Tag et push
docker tag order-service:latest <account-id>.dkr.ecr.eu-west-1.amazonaws.com/order-service:latest
docker push <account-id>.dkr.ecr.eu-west-1.amazonaws.com/order-service:latest

# Répéter pour les autres services
```

3. **Créer un cluster ECS:**
```bash
aws ecs create-cluster --cluster-name delivery-cluster
```

4. **Déployer avec Fargate:**
- Créer des task definitions pour chaque service
- Créer des services ECS
- Configurer un Application Load Balancer

#### Option 2: EKS (Kubernetes)

Voir [kubernetes/README.md](./kubernetes/README.md)

---

### Google Cloud Platform

#### Option 1: Cloud Run

1. **Build et push vers GCR:**
```bash
# Configurer gcloud
gcloud auth configure-docker

# Build et push
docker tag order-service:latest gcr.io/<project-id>/order-service:latest
docker push gcr.io/<project-id>/order-service:latest
```

2. **Déployer sur Cloud Run:**
```bash
gcloud run deploy order-service \
  --image gcr.io/<project-id>/order-service:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

#### Option 2: GKE (Kubernetes)

Voir [kubernetes/README.md](./kubernetes/README.md)

---

### Azure

#### Option 1: Container Instances

```bash
# Créer un groupe de ressources
az group create --name delivery-rg --location westeurope

# Déployer les containers
az container create \
  --resource-group delivery-rg \
  --name order-service \
  --image <registry>/order-service:latest \
  --ports 50051 \
  --environment-variables KAFKA_BROKER=<kafka-url>
```

#### Option 2: AKS (Kubernetes)

Voir [kubernetes/README.md](./kubernetes/README.md)

---

## ⚙️ Configuration Production

### Variables d'environnement

#### Order Service
```env
GRPC_PORT=50051
KAFKA_BROKER=kafka:9092
DB_PATH=./data/orders.db
NODE_ENV=production
LOG_LEVEL=info
```

#### Delivery Service
```env
GRPC_PORT=50052
KAFKA_BROKER=kafka:9092
NODE_ENV=production
LOG_LEVEL=info
```

#### Tracking Service
```env
GRPC_PORT=50053
KAFKA_BROKER=kafka:9092
DB_PATH=./data/tracking.db
NODE_ENV=production
LOG_LEVEL=info
```

#### API Gateway
```env
PORT=3000
ORDER_SERVICE_URL=order-service:50051
DELIVERY_SERVICE_URL=delivery-service:50052
TRACKING_SERVICE_URL=tracking-service:50053
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=https://votre-domaine.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### Kafka Production

```yaml
# docker-compose.prod.yml
kafka:
  environment:
    KAFKA_NUM_PARTITIONS: 3
    KAFKA_DEFAULT_REPLICATION_FACTOR: 3
    KAFKA_MIN_INSYNC_REPLICAS: 2
    KAFKA_LOG_RETENTION_HOURS: 168
    KAFKA_LOG_SEGMENT_BYTES: 1073741824
    KAFKA_COMPRESSION_TYPE: snappy
```

---

## 📊 Monitoring

### Prometheus + Grafana

1. **Ajouter Prometheus au docker-compose:**
```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  networks:
    - delivery-network

grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  networks:
    - delivery-network
```

2. **Configuration Prometheus (prometheus.yml):**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'order-service'
    static_configs:
      - targets: ['order-service:50051']
  
  - job_name: 'delivery-service'
    static_configs:
      - targets: ['delivery-service:50052']
  
  - job_name: 'tracking-service'
    static_configs:
      - targets: ['tracking-service:50053']
  
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']
```

### Logs centralisés (ELK Stack)

```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
  environment:
    - discovery.type=single-node
  ports:
    - "9200:9200"

logstash:
  image: docker.elastic.co/logstash/logstash:8.8.0
  volumes:
    - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  ports:
    - "5000:5000"

kibana:
  image: docker.elastic.co/kibana/kibana:8.8.0
  ports:
    - "5601:5601"
  environment:
    - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

---

## 🔒 Sécurité

### 1. HTTPS/TLS

Utilisez un reverse proxy (Nginx ou Traefik) avec Let's Encrypt:

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./certs:/etc/nginx/certs
  depends_on:
    - api-gateway
```

### 2. Authentication JWT

Ajoutez un middleware d'authentification dans l'API Gateway:

```javascript
// api-gateway/src/middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}
```

### 3. Rate Limiting

```javascript
// api-gateway/src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: 'Trop de requêtes, réessayez plus tard'
});

app.use('/api/', limiter);
```

### 4. Secrets Management

Utilisez des secrets managers:
- **AWS:** AWS Secrets Manager
- **GCP:** Secret Manager
- **Azure:** Key Vault
- **Kubernetes:** Secrets

---

## 💾 Backup

### Bases de données SQLite

```bash
# Script de backup automatique
#!/bin/bash

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup Order Service
docker exec order-service sqlite3 /app/data/orders.db ".backup '/app/data/orders_backup_${DATE}.db'"
docker cp order-service:/app/data/orders_backup_${DATE}.db ${BACKUP_DIR}/

# Backup Tracking Service
docker exec tracking-service sqlite3 /app/data/tracking.db ".backup '/app/data/tracking_backup_${DATE}.db'"
docker cp tracking-service:/app/data/tracking_backup_${DATE}.db ${BACKUP_DIR}/

# Supprimer les backups de plus de 7 jours
find ${BACKUP_DIR} -name "*.db" -mtime +7 -delete
```

### Kafka Topics

```bash
# Backup des topics Kafka
docker exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order.created \
  --from-beginning \
  --max-messages 10000 > backup_order_created.json
```

---

## 🔄 CI/CD

### GitHub Actions

Créez `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker images
      run: |
        docker-compose -f docker-compose.full.yml build
    
    - name: Run tests
      run: |
        npm test
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker-compose -f docker-compose.full.yml push
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /app
          docker-compose -f docker-compose.full.yml pull
          docker-compose -f docker-compose.full.yml up -d
```

---

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
order-service:
  deploy:
    replicas: 3
    
delivery-service:
  deploy:
    replicas: 3
    
tracking-service:
  deploy:
    replicas: 3
```

### Load Balancer

```yaml
nginx:
  image: nginx:alpine
  volumes:
    - ./nginx-lb.conf:/etc/nginx/nginx.conf
  ports:
    - "80:80"
  depends_on:
    - api-gateway
```

**nginx-lb.conf:**
```nginx
upstream api_gateway {
    least_conn;
    server api-gateway-1:3000;
    server api-gateway-2:3000;
    server api-gateway-3:3000;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://api_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Secrets sécurisés
- [ ] HTTPS/TLS activé
- [ ] Authentication mise en place
- [ ] Rate limiting configuré
- [ ] Monitoring actif (Prometheus + Grafana)
- [ ] Logs centralisés (ELK)
- [ ] Backups automatiques
- [ ] CI/CD configuré
- [ ] Tests de charge effectués
- [ ] Documentation à jour
- [ ] Plan de rollback préparé

---

## 🆘 Support

En cas de problème:
1. Vérifier les logs: `docker-compose logs -f`
2. Vérifier le statut: `docker-compose ps`
3. Redémarrer un service: `docker-compose restart <service>`
4. Consulter la documentation
