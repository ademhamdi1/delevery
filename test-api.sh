#!/bin/bash

# Script de test de l'API

echo "🧪 Test du Système de Livraison"
echo "================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Créer une commande
echo -e "${BLUE}1. Création d'une commande...${NC}"
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Ahmed Ben Ali",
    "customer_phone": "+216 20 123 456",
    "pickup_address": "Avenue Habib Bourguiba, Tunis",
    "delivery_address": "Rue de la Liberté, La Marsa",
    "package_description": "Documents importants",
    "package_weight": 0.5
  }')

ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"order_id":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✓ Commande créée: $ORDER_ID${NC}"
echo ""

# Attendre l'auto-assignment
echo "⏳ Attente de l'auto-assignment du livreur (2 secondes)..."
sleep 2
echo ""

# 2. Obtenir la commande
echo -e "${BLUE}2. Récupération de la commande...${NC}"
curl -s http://localhost:3000/api/orders/$ORDER_ID | jq '.'
echo ""

# 3. Lister les livreurs disponibles
echo -e "${BLUE}3. Liste des livreurs disponibles...${NC}"
curl -s http://localhost:3000/api/deliveries/drivers/available | jq '.drivers[] | {name, vehicle_type, rating}'
echo ""

# 4. Obtenir la livraison
echo -e "${BLUE}4. Informations de livraison...${NC}"
curl -s http://localhost:3000/api/deliveries/$ORDER_ID | jq '.'
echo ""

# 5. Mettre à jour la position
echo -e "${BLUE}5. Mise à jour de la position...${NC}"
curl -s -X PUT http://localhost:3000/api/tracking/$ORDER_ID/location \
  -H "Content-Type: application/json" \
  -d '{
    "current_location": {
      "latitude": 36.8100,
      "longitude": 10.1750
    },
    "speed": 35.5
  }' | jq '.'
echo ""

# 6. Obtenir le tracking
echo -e "${BLUE}6. Suivi en temps réel...${NC}"
curl -s http://localhost:3000/api/tracking/$ORDER_ID | jq '.'
echo ""

echo -e "${GREEN}✅ Tests terminés avec succès!${NC}"
echo ""
echo "💡 Testez GraphQL: http://localhost:3000/graphql"
echo "📊 Commande ID: $ORDER_ID"
