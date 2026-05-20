# Script de tests automatisés pour le système de livraison
# PowerShell

Write-Host "🚀 Démarrage des tests automatisés..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3000"
$testResults = @()

# Fonction pour tester un endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Name..." -ForegroundColor Yellow
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -ContentType "application/json" -Body $Body -ErrorAction Stop
        }
        
        Write-Host "✅ PASS: $Name" -ForegroundColor Green
        $script:testResults += @{ Name = $Name; Status = "PASS"; Response = $response }
        return $response
    }
    catch {
        Write-Host "❌ FAIL: $Name - $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += @{ Name = $Name; Status = "FAIL"; Error = $_.Exception.Message }
        return $null
    }
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST 1: Créer une commande" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

$orderBody = @{
    customer_name = "Test Automation"
    customer_phone = "+216 20 999 888"
    pickup_address = "Tunis Centre"
    delivery_address = "La Marsa"
    package_weight = 2.5
} | ConvertTo-Json

$order = Test-Endpoint -Name "Create Order" -Method "POST" -Url "$baseUrl/api/orders" -Body $orderBody

if ($order) {
    $orderId = $order.order_id
    Write-Host "Order ID: $orderId" -ForegroundColor Magenta
    Write-Host ""
    
    Write-Host "Attente de 5 secondes pour l'auto-assignment..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  TEST 2: Vérifier la commande" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    Test-Endpoint -Name "Get Order" -Method "GET" -Url "$baseUrl/api/orders/$orderId"
    Write-Host ""
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  TEST 3: Vérifier la livraison" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $delivery = Test-Endpoint -Name "Get Delivery" -Method "GET" -Url "$baseUrl/api/deliveries/$orderId"
    Write-Host ""
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  TEST 4: Vérifier le tracking" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $tracking = Test-Endpoint -Name "Get Tracking" -Method "GET" -Url "$baseUrl/api/tracking/$orderId"
    Write-Host ""
    
    if ($tracking) {
        Write-Host "Distance restante: $($tracking.distance_remaining_km) km" -ForegroundColor Magenta
        Write-Host "ETA: $($tracking.estimated_minutes) minutes" -ForegroundColor Magenta
        Write-Host ""
    }
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  TEST 5: Mettre à jour le statut à PICKED_UP" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $statusBody = @{
        order_id = $orderId
        status = "PICKED_UP"
    } | ConvertTo-Json
    
    Test-Endpoint -Name "Update Status to PICKED_UP" -Method "PUT" -Url "$baseUrl/api/deliveries/$orderId/status" -Body $statusBody
    Write-Host ""
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  TEST 6: Mettre à jour la position" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $locationBody = @{
        order_id = $orderId
        current_location = @{
            latitude = 36.8150
            longitude = 10.1700
        }
    } | ConvertTo-Json -Depth 3
    
    $updatedTracking = Test-Endpoint -Name "Update Location" -Method "PUT" -Url "$baseUrl/api/tracking/$orderId/location" -Body $locationBody
    Write-Host ""
    
    if ($updatedTracking) {
        Write-Host "Nouvelle distance restante: $($updatedTracking.distance_remaining_km) km" -ForegroundColor Magenta
        Write-Host "Nouveau ETA: $($updatedTracking.estimated_minutes) minutes" -ForegroundColor Magenta
        Write-Host ""
    }
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  TEST 7: Mettre à jour le statut à DELIVERED" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $deliveredBody = @{
        order_id = $orderId
        status = "DELIVERED"
    } | ConvertTo-Json
    
    Test-Endpoint -Name "Update Status to DELIVERED" -Method "PUT" -Url "$baseUrl/api/deliveries/$orderId/status" -Body $deliveredBody
    Write-Host ""
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  TEST 8: Lister les livreurs disponibles" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $drivers = Test-Endpoint -Name "List Available Drivers" -Method "GET" -Url "$baseUrl/api/deliveries/drivers/available"
    Write-Host ""
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  TEST 9: GraphQL - Livreurs disponibles" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $graphqlBody = @{
        query = "{ availableDrivers { name vehicle_type rating } }"
    } | ConvertTo-Json
    
    Test-Endpoint -Name "GraphQL Available Drivers" -Method "POST" -Url "$baseUrl/graphql" -Body $graphqlBody
    Write-Host ""
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  TEST 10: Lister toutes les commandes" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    Test-Endpoint -Name "List All Orders" -Method "GET" -Url "$baseUrl/api/orders"
    Write-Host ""
}

# Résumé des tests
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $testResults.Count

Write-Host "Total: $totalCount tests" -ForegroundColor White
Write-Host "✅ Réussis: $passCount" -ForegroundColor Green
Write-Host "❌ Échoués: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 Tous les tests sont passés avec succès!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Tests échoués:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
