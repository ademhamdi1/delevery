#!/bin/bash

# Script pour arrêter tous les services

echo "🛑 Arrêt du Système de Livraison"
echo "================================="
echo ""

# Arrêter les processus Node.js
echo "Arrêt des microservices..."
pkill -f "node.*order-service"
pkill -f "node.*delivery-service"
pkill -f "node.*tracking-service"
pkill -f "node.*api-gateway"

echo "✓ Microservices arrêtés"
echo ""

# Arrêter Kafka
echo "Arrêt de Kafka..."
docker-compose down

echo ""
echo "✅ Tous les services sont arrêtés!"
