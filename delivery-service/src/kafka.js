const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const { getDriversCollection, getDeliveriesCollection } = require('./database');

let kafka;
let producer;
let consumer;

async function initKafka() {
  kafka = new Kafka({
    clientId: 'delivery-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });

  producer = kafka.producer();
  await producer.connect();

  consumer = kafka.consumer({ groupId: 'delivery-service-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'order.created', fromBeginning: false });

  // Écouter les événements order.created pour auto-assignment
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      console.log('Événement reçu:', topic, event);

      if (topic === 'order.created') {
        // Auto-assigner un livreur disponible
        await autoAssignDriver(event);
      }
    }
  });
}

async function autoAssignDriver(orderEvent) {
  try {
    const driversCollection = getDriversCollection();
    const deliveriesCollection = getDeliveriesCollection();

    // Trouver un livreur disponible
    const availableDrivers = await driversCollection
      .find({ selector: { is_available: true } })
      .exec();

    if (availableDrivers.length === 0) {
      console.log('Aucun livreur disponible pour la commande', orderEvent.order_id);
      return;
    }

    // Prendre le premier livreur disponible (logique simple)
    const driver = availableDrivers[0];

    // Créer la livraison
    const delivery = {
      id: uuidv4(),
      order_id: orderEvent.order_id,
      driver_id: driver.id,
      status: 'ASSIGNED',
      assigned_at: new Date().toISOString(),
      picked_up_at: null,
      delivered_at: null
    };

    await deliveriesCollection.insert(delivery);

    // Marquer le livreur comme non disponible
    await driver.update({ $set: { is_available: false } });

    // Publier l'événement delivery.assigned
    await publishEvent('delivery.assigned', {
      delivery_id: delivery.id,
      order_id: orderEvent.order_id,
      driver_id: driver.id,
      driver_name: driver.name,
      driver_phone: driver.phone,
      vehicle_type: driver.vehicle_type,
      assigned_at: delivery.assigned_at
    });

    console.log(`✓ Livreur ${driver.name} assigné à la commande ${orderEvent.order_id}`);
  } catch (error) {
    console.error('Erreur lors de l\'auto-assignment:', error);
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
