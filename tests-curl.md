# Tests avec curl - Système de Livraison

## 🧪 Tous les tests en ligne de commande

Copiez-collez ces commandes dans PowerShell.

---

## 1. Health Check

```powershell
curl http://localhost:3000/health
```

---

## 2. ORDERS

### Créer une commande
```powershell
curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d '{\"customer_name\":\"Ahmed Ben Ali\",\"customer_phone\":\"+216 20 123 456\",\"pickup_address\":\"Tunis Centre\",\"delivery_address\":\"La Marsa\",\"package_weight\":1.5}'
```

**Copiez l'order_id retourné !**

### Lister toutes les commandes
```powershell
curl http://localhost:3000/api/orders
```

### Obtenir une commande (remplacez ORDER_ID)
```powershell
curl http://localhost:3000/api/orders/ORDER_ID
```

### Mettre à jour une commande
```powershell
curl -X PUT http://localhost:3000/api/orders/ORDER_ID -H "Content-Type: application/json" -d '{\"status\":\"IN_TRANSIT\"}'
```

### Annuler une commande
```powershell
curl -X DELETE http://localhost:3000/api/orders/ORDER_ID -H "Content-Type: application/json" -d '{\"reason\":\"Client a annulé\"}'
```

---

## 3. DELIVERIES

### Lister les livreurs disponibles
```powershell
curl http://localhost:3000/api/deliveries/drivers/available
```

### Obtenir une livraison
```powershell
curl http://localhost:3000/api/deliveries/ORDER_ID
```

### Assigner un livreur manuellement
```powershell
curl -X POST http://localhost:3000/api/deliveries/assign -H "Content-Type: application/json" -d '{\"order_id\":\"ORDER_ID\",\"driver_id\":\"driver-1\"}'
```

### Mettre à jour le statut de livraison
```powershell
curl -X PUT http://localhost:3000/api/deliveries/ORDER_ID/status -H "Content-Type: application/json" -d '{\"status\":\"PICKED_UP\",\"current_location\":{\"latitude\":36.8065,\"longitude\":10.1815}}'
```

### Obtenir un livreur
```powershell
curl http://localhost:3000/api/deliveries/drivers/driver-1
```

---

## 4. TRACKING

### Démarrer le suivi
```powershell
curl -X POST http://localhost:3000/api/tracking/start -H "Content-Type: application/json" -d '{\"order_id\":\"ORDER_ID\",\"driver_id\":\"driver-1\",\"pickup_location\":{\"latitude\":36.8065,\"longitude\":10.1815},\"delivery_location\":{\"latitude\":36.8189,\"longitude\":10.1658}}'
```

### Mettre à jour la position
```powershell
curl -X PUT http://localhost:3000/api/tracking/ORDER_ID/location -H "Content-Type: application/json" -d '{\"current_location\":{\"latitude\":36.8100,\"longitude\":10.1750},\"speed\":35.5}'
```

### Obtenir la position actuelle
```powershell
curl http://localhost:3000/api/tracking/ORDER_ID
```

### Obtenir l'historique des positions
```powershell
curl http://localhost:3000/api/tracking/ORDER_ID/history
```

### Calculer l'ETA
```powershell
curl -X POST http://localhost:3000/api/tracking/calculate-eta -H "Content-Type: application/json" -d '{\"order_id\":\"ORDER_ID\",\"current_location\":{\"latitude\":36.8100,\"longitude\":10.1750},\"destination\":{\"latitude\":36.8189,\"longitude\":10.1658}}'
```

---

## 💡 CONSEIL

**Utilisez GraphQL** (http://localhost:3000/graphql) - c'est plus facile et plus puissant !

Vous avez déjà testé et ça fonctionne parfaitement ! 🎉
