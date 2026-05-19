const { Kafka } = require('kafkajs');

let kafka;
let producer;
let consumer;

async function initKafka() {
  kafka = new Kafka({
    clientId: 'order-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });

  producer = kafka.producer();
  await producer.connect();

  consumer = kafka.consumer({ groupId: 'order-service-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'delivery.assigned', fromBeginning: false });

  // Écouter les événements delivery.assigned
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      console.log('Événement reçu:', topic, event);

      if (topic === 'delivery.assigned') {
        // Mettre à jour le statut de la commande
        const { updateOrder } = require('./database');
        await updateOrder(event.order_id, { status: 'ASSIGNED' });
        console.log(`Commande ${event.order_id} assignée au livreur ${event.driver_id}`);
      }
    }
  });
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
