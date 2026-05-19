#!/bin/bash

# Script pour démarrer tous les services

echo "🚀 Démarrage du Système de Livraison"
echo "====================================="
echo ""

# Vérifier si Kafka est démarré
if ! docker ps | grep -q kafka; then
    echo "⚠️  Kafka n'est pas démarré. Démarrage de Kafka..."
    docker-compose up -d
    echo "⏳ Attente du démarrage de Kafka (10 secondes)..."
    sleep 10
else
    echo "✓ Kafka est déjà démarré"
fi

echo ""
echo "📦 Démarrage des microservices..."
echo ""

# Démarrer les services en arrière-plan
echo "1. Démarrage de Order Service (port 50051)..."
cd order-service && npm start &
ORDER_PID=$!

echo "2. Démarrage de Delivery Service (port 50052)..."
cd ../delivery-service && npm start &
DELIVERY_PID=$!

echo "3. Démarrage de Tracking Service (port 50053)..."
cd ../tracking-service && npm start &
TRACKING_PID=$!

echo "4. Démarrage de API Gateway (port 3000)..."
cd ../api-gateway && npm start &
GATEWAY_PID=$!

cd ..

echo ""
echo "✅ Tous les services sont démarrés!"
echo ""
echo "📍 URLs:"
echo "  - API REST: http://localhost:3000/api"
echo "  - GraphQL: http://localhost:3000/graphql"
echo ""
echo "🛑 Pour arrêter tous les services:"
echo "  kill $ORDER_PID $DELIVERY_PID $TRACKING_PID $GATEWAY_PID"
echo ""
echo "📝 PIDs des processus:"
echo "  Order Service: $ORDER_PID"
echo "  Delivery Service: $DELIVERY_PID"
echo "  Tracking Service: $TRACKING_PID"
echo "  API Gateway: $GATEWAY_PID"
