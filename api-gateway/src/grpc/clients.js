const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

let orderClient;
let deliveryClient;
let trackingClient;

async function initGrpcClients() {
  // Charger les fichiers proto
  const ORDER_PROTO_PATH = path.join(__dirname, '../../../proto/order.proto');
  const DELIVERY_PROTO_PATH = path.join(__dirname, '../../../proto/delivery.proto');
  const TRACKING_PROTO_PATH = path.join(__dirname, '../../../proto/tracking.proto');

  const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  };

  // Order Service
  const orderPackageDef = protoLoader.loadSync(ORDER_PROTO_PATH, options);
  const orderProto = grpc.loadPackageDefinition(orderPackageDef).order;
  orderClient = new orderProto.OrderService(
    process.env.ORDER_SERVICE_URL || 'localhost:50051',
    grpc.credentials.createInsecure()
  );

  // Delivery Service
  const deliveryPackageDef = protoLoader.loadSync(DELIVERY_PROTO_PATH, options);
  const deliveryProto = grpc.loadPackageDefinition(deliveryPackageDef).delivery;
  deliveryClient = new deliveryProto.DeliveryService(
    process.env.DELIVERY_SERVICE_URL || 'localhost:50052',
    grpc.credentials.createInsecure()
  );

  // Tracking Service
  const trackingPackageDef = protoLoader.loadSync(TRACKING_PROTO_PATH, options);
  const trackingProto = grpc.loadPackageDefinition(trackingPackageDef).tracking;
  trackingClient = new trackingProto.TrackingService(
    process.env.TRACKING_SERVICE_URL || 'localhost:50053',
    grpc.credentials.createInsecure()
  );
}

function getOrderClient() {
  return orderClient;
}

function getDeliveryClient() {
  return deliveryClient;
}

function getTrackingClient() {
  return trackingClient;
}

module.exports = {
  initGrpcClients,
  getOrderClient,
  getDeliveryClient,
  getTrackingClient
};
