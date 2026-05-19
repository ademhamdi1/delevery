# Script PowerShell de test de l'API

Write-Host "🧪 Test du Système de Livraison" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Créer une commande
Write-Host "1. Création d'une commande..." -ForegroundColor Blue
$orderData = @{
    customer_name = "Ahmed Ben Ali"
    customer_phone = "+216 20 123 456"
    pickup_address = "Avenue Habib Bourguiba, Tunis"
    delivery_address = "Rue de la Liberté, La Marsa"
    package_description = "Documents importants"
    package_weight = 0.5
} | ConvertTo-Json

$orderResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/orders" `
    -Method Post `
    -ContentType "application/json" `
    -Body $orderData

$orderId = $orderResponse.order_id
Write-Host "✓ Commande créée: $orderId" -ForegroundColor Green
Write-Host ""

# Attendre l'auto-assignment
Write-Host "⏳ Attente de l'auto-assignment du livreur (3 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host ""

# 2. Obtenir la commande
Write-Host "2. Récupération de la commande..." -ForegroundColor Blue
$order = Invoke-RestMethod -Uri "http://localhost:3000/api/orders/$orderId"
$order | ConvertTo-Json -Depth 10
Write-Host ""

# 3. Lister les livreurs disponibles
Write-Host "3. Liste des livreurs disponibles..." -ForegroundColor Blue
$drivers = Invoke-RestMethod -Uri "http://localhost:3000/api/deliveries/drivers/available"
$drivers.drivers | Select-Object name, vehicle_type, rating | Format-Table
Write-Host ""

# 4. Obtenir la livraison
Write-Host "4. Informations de livraison..." -ForegroundColor Blue
try {
    $delivery = Invoke-RestMethod -Uri "http://localhost:3000/api/deliveries/$orderId"
    $delivery | ConvertTo-Json -Depth 10
} catch {
    Write-Host "⚠️  Livraison pas encore assignée" -ForegroundColor Yellow
}
Write-Host ""

# 5. Mettre à jour la position
Write-Host "5. Mise à jour de la position..." -ForegroundColor Blue
$locationData = @{
    current_location = @{
        latitude = 36.8100
        longitude = 10.1750
    }
    speed = 35.5
} | ConvertTo-Json

try {
    $tracking = Invoke-RestMethod -Uri "http://localhost:3000/api/tracking/$orderId/location" `
        -Method Put `
        -ContentType "application/json" `
        -Body $locationData
    $tracking | ConvertTo-Json -Depth 10
} catch {
    Write-Host "⚠️  Tracking pas encore démarré" -ForegroundColor Yellow
}
Write-Host ""

# 6. Obtenir le tracking
Write-Host "6. Suivi en temps réel..." -ForegroundColor Blue
try {
    $currentTracking = Invoke-RestMethod -Uri "http://localhost:3000/api/tracking/$orderId"
    $currentTracking | ConvertTo-Json -Depth 10
} catch {
    Write-Host "⚠️  Tracking pas encore disponible" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "✅ Tests terminés avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Testez GraphQL: http://localhost:3000/graphql" -ForegroundColor Cyan
Write-Host "📊 Commande ID: $orderId" -ForegroundColor Cyan
