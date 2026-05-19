const { Kafka } = require('kafkajs');
const { createTracking } = require('./database');
const { v4: uuidv4 } = require('uuid');

let kafka;
let producer;
let consumer;

async function initKafka() {
  kafka = new Kafka({
    clientId: 'tracking-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });

  producer = kafka.producer();
  await producer.connect();

  consumer = kafka.consumer({ groupId: 'tracking-service-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'delivery.assigned', fromBeginning: false });

  // Écouter les événements delivery.assigned pour démarrer le tracking
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      console.log('Événement reçu:', topic, event);

      if (topic === 'delivery.assigned') {
        // Démarrer le tracking automatiquement
        await startTrackingFromEvent(event);
      }
    }
  });
}

async function startTrackingFromEvent(deliveryEvent) {
  try {
    // Pour simplifier, on utilise des coordonnées par défaut
    // Dans un vrai système, ces coordonnées viendraient de la commande
    const tracking = {
      id: uuidv4(),
      order_id: deliveryEvent.order_id,
      driver_id: deliveryEvent.driver_id,
      pickup_latitude: 36.8065,
      pickup_longitude: 10.1815,
      delivery_latitude: 36.8189,
      delivery_longitude: 10.1658,
      distance_remaining_km: 2.5,
      estimated_minutes: 5
    };

    await createTracking(tracking);
    console.log(`✓ Tracking démarré pour la commande ${deliveryEvent.order_id}`);
  } catch (error) {
    console.error('Erreur lors du démarrage du tracking:', error);
  }
}

async function publishEvent(topic, event) {
  await producer.send({
    topic,
    messages: [
      {
        key: event.order_id || event.id,
        value: JSON.stringify(event)
      }
    ]
  });
  console.log(`Événement publié sur ${topic}:`, event);
}

module.exports = {
  initKafka,
  publishEvent
};
