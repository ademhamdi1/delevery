const { v4: uuidv4 } = require('uuid');
const { getDriversCollection, getDeliveriesCollection } = require('../database');
const { publishEvent } = require('../kafka');

// Handler pour AssignDriver
async function AssignDriver(call, callback) {
  try {
    const { order_id, driver_id } = call.request;

    if (!order_id) {
      return callback({
        code: 3,
        message: 'order_id est requis'
      });
    }

    const driversCollection = getDriversCollection();
    const deliveriesCollection = getDeliveriesCollection();

    let driver;

    if (driver_id) {
      // Assigner un livreur spécifique
      driver = await driversCollection.findOne(driver_id).exec();
      if (!driver) {
        return callback({
          code: 5,
          message: 'Livreur non trouvé'
        });
      }
    } else {
      // Auto-assigner un livreur disponible
      const availableDrivers = await driversCollection
        .find({ selector: { is_available: true } })
        .exec();

      if (availableDrivers.length === 0) {
        return callback({
          code: 9, // FAILED_PRECONDITION
          message: 'Aucun livreur disponible'
        });
      }

      driver = availableDrivers[0];
    }

    // Créer la livraison
    const delivery = {
      id: uuidv4(),
      order_id,
      driver_id: driver.id,
      status: 'ASSIGNED',
      assigned_at: new Date().toISOString(),
      picked_up_at: null,
      delivered_at: null
    };

    await deliveriesCollection.insert(delivery);

    // Marquer le livreur comme non disponible
    await driver.update({ $set: { is_available: false } });

    // Publier l'événement
    await publishEvent('delivery.assigned', {
      delivery_id: delivery.id,
      order_id,
      driver_id: driver.id,
      driver_name: driver.name,
      assigned_at: delivery.assigned_at
    });

    callback(null, {
      delivery_id: delivery.id,
      order_id,
      driver_id: driver.id,
      driver_name: driver.name,
      driver_phone: driver.phone,
      vehicle_type: driver.vehicle_type,
      vehicle_plate: driver.vehicle_plate,
      status: delivery.status,
      current_location: driver.current_location,
      assigned_at: delivery.assigned_at,
      picked_up_at: null,
      delivered_at: null
    });
  } catch (error) {
    console.error('Erreur AssignDriver:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour GetDelivery
async function GetDelivery(call, callback) {
  try {
    const { order_id } = call.request;

    if (!order_id) {
      return callback({
        code: 3,
        message: 'order_id est requis'
      });
    }

    const deliveriesCollection = getDeliveriesCollection();
    const driversCollection = getDriversCollection();

    const delivery = await deliveriesCollection
      .findOne({ selector: { order_id } })
      .exec();

    if (!delivery) {
      return callback({
        code: 5,
        message: 'Livraison non trouvée'
      });
    }

    const driver = await driversCollection.findOne(delivery.driver_id).exec();

    callback(null, {
      delivery_id: delivery.id,
      order_id: delivery.order_id,
      driver_id: driver.id,
      driver_name: driver.name,
      driver_phone: driver.phone,
      vehicle_type: driver.vehicle_type,
      vehicle_plate: driver.vehicle_plate,
      status: delivery.status,
      current_location: driver.current_location,
      assigned_at: delivery.assigned_at,
      picked_up_at: delivery.picked_up_at,
      delivered_at: delivery.delivered_at
    });
  } catch (error) {
    console.error('Erreur GetDelivery:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour UpdateDeliveryStatus
async function UpdateDeliveryStatus(call, callback) {
  try {
    const { order_id, status, current_location } = call.request;

    if (!order_id || !status) {
      return callback({
        code: 3,
        message: 'order_id et status sont requis'
      });
    }

    const deliveriesCollection = getDeliveriesCollection();
    const driversCollection = getDriversCollection();

    const delivery = await deliveriesCollection
      .findOne({ selector: { order_id } })
      .exec();

    if (!delivery) {
      return callback({
        code: 5,
        message: 'Livraison non trouvée'
      });
    }

    const updates = { status };

    if (status === 'PICKED_UP') {
      updates.picked_up_at = new Date().toISOString();
    } else if (status === 'DELIVERED') {
      updates.delivered_at = new Date().toISOString();
      
      // Libérer le livreur
      const driver = await driversCollection.findOne(delivery.driver_id).exec();
      await driver.update({ $set: { is_available: true } });
    }

    await delivery.update({ $set: updates });

    // Mettre à jour la position du livreur si fournie
    if (current_location) {
      const driver = await driversCollection.findOne(delivery.driver_id).exec();
      await driver.update({ $set: { current_location } });
    }

    // Publier l'événement
    await publishEvent('delivery.status.changed', {
      delivery_id: delivery.id,
      order_id,
      status,
      updated_at: new Date().toISOString()
    });

    const driver = await driversCollection.findOne(delivery.driver_id).exec();

    callback(null, {
      delivery_id: delivery.id,
      order_id: delivery.order_id,
      driver_id: driver.id,
      driver_name: driver.name,
      driver_phone: driver.phone,
      vehicle_type: driver.vehicle_type,
      vehicle_plate: driver.vehicle_plate,
      status: delivery.status,
      current_location: driver.current_location,
      assigned_at: delivery.assigned_at,
      picked_up_at: delivery.picked_up_at,
      delivered_at: delivery.delivered_at
    });
  } catch (error) {
    console.error('Erreur UpdateDeliveryStatus:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour ListAvailableDrivers
async function ListAvailableDrivers(call, callback) {
  try {
    const driversCollection = getDriversCollection();

    const drivers = await driversCollection
      .find({ selector: { is_available: true } })
      .exec();

    const driversList = drivers.map(driver => ({
      driver_id: driver.id,
      name: driver.name,
      phone: driver.phone,
      vehicle_type: driver.vehicle_type,
      vehicle_plate: driver.vehicle_plate,
      is_available: driver.is_available,
      current_location: driver.current_location,
      rating: driver.rating,
      total_deliveries: driver.total_deliveries
    }));

    callback(null, { drivers: driversList });
  } catch (error) {
    console.error('Erreur ListAvailableDrivers:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour GetDriver
async function GetDriver(call, callback) {
  try {
    const { driver_id } = call.request;

    if (!driver_id) {
      return callback({
        code: 3,
        message: 'driver_id est requis'
      });
    }

    const driversCollection = getDriversCollection();
    const driver = await driversCollection.findOne(driver_id).exec();

    if (!driver) {
      return callback({
        code: 5,
        message: 'Livreur non trouvé'
      });
    }

    callback(null, {
      driver_id: driver.id,
      name: driver.name,
      phone: driver.phone,
      vehicle_type: driver.vehicle_type,
      vehicle_plate: driver.vehicle_plate,
      is_available: driver.is_available,
      current_location: driver.current_location,
      rating: driver.rating,
      total_deliveries: driver.total_deliveries
    });
  } catch (error) {
    console.error('Erreur GetDriver:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

module.exports = {
  AssignDriver,
  GetDelivery,
  UpdateDeliveryStatus,
  ListAvailableDrivers,
  GetDriver
};
