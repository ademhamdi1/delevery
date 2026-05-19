const { v4: uuidv4 } = require('uuid');
const { createOrder, getOrder, listOrders, updateOrder, cancelOrder } = require('../database');
const { publishEvent } = require('../kafka');

// Handler pour CreateOrder
async function CreateOrder(call, callback) {
  try {
    const { customer_name, customer_phone, pickup_address, delivery_address, 
            package_description, package_weight } = call.request;

    // Validation
    if (!customer_name || !customer_phone || !pickup_address || !delivery_address) {
      return callback({
        code: 3, // INVALID_ARGUMENT
        message: 'Champs obligatoires manquants'
      });
    }

    // Créer la commande
    const order = {
      id: uuidv4(),
      customer_name,
      customer_phone,
      pickup_address,
      delivery_address,
      package_description: package_description || '',
      package_weight: package_weight || 0,
      status: 'PENDING'
    };

    await createOrder(order);

    // Publier l'événement sur Kafka
    await publishEvent('order.created', {
      order_id: order.id,
      customer_name: order.customer_name,
      pickup_address: order.pickup_address,
      delivery_address: order.delivery_address,
      package_weight: order.package_weight,
      created_at: new Date().toISOString()
    });

    // Retourner la réponse
    callback(null, {
      order_id: order.id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      pickup_address: order.pickup_address,
      delivery_address: order.delivery_address,
      package_description: order.package_description,
      package_weight: order.package_weight,
      status: order.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur CreateOrder:', error);
    callback({
      code: 13, // INTERNAL
      message: error.message
    });
  }
}

// Handler pour GetOrder
async function GetOrder(call, callback) {
  try {
    const { order_id } = call.request;

    if (!order_id) {
      return callback({
        code: 3,
        message: 'order_id est requis'
      });
    }

    const order = await getOrder(order_id);

    if (!order) {
      return callback({
        code: 5, // NOT_FOUND
        message: 'Commande non trouvée'
      });
    }

    callback(null, {
      order_id: order.id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      pickup_address: order.pickup_address,
      delivery_address: order.delivery_address,
      package_description: order.package_description,
      package_weight: order.package_weight,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at
    });
  } catch (error) {
    console.error('Erreur GetOrder:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour ListOrders
async function ListOrders(call, callback) {
  try {
    const { page = 1, limit = 10, status } = call.request;

    const result = await listOrders(page, limit, status || null);

    const orders = result.orders.map(order => ({
      order_id: order.id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      pickup_address: order.pickup_address,
      delivery_address: order.delivery_address,
      package_description: order.package_description,
      package_weight: order.package_weight,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at
    }));

    callback(null, {
      orders,
      total: result.total
    });
  } catch (error) {
    console.error('Erreur ListOrders:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour UpdateOrder
async function UpdateOrder(call, callback) {
  try {
    const { order_id, status, delivery_address } = call.request;

    if (!order_id) {
      return callback({
        code: 3,
        message: 'order_id est requis'
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (delivery_address) updates.delivery_address = delivery_address;

    const order = await updateOrder(order_id, updates);

    if (!order) {
      return callback({
        code: 5,
        message: 'Commande non trouvée'
      });
    }

    // Publier l'événement
    await publishEvent('order.updated', {
      order_id: order.id,
      status: order.status,
      updated_at: new Date().toISOString()
    });

    callback(null, {
      order_id: order.id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      pickup_address: order.pickup_address,
      delivery_address: order.delivery_address,
      package_description: order.package_description,
      package_weight: order.package_weight,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at
    });
  } catch (error) {
    console.error('Erreur UpdateOrder:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour CancelOrder
async function CancelOrder(call, callback) {
  try {
    const { order_id, reason } = call.request;

    if (!order_id) {
      return callback({
        code: 3,
        message: 'order_id est requis'
      });
    }

    const order = await cancelOrder(order_id);

    if (!order) {
      return callback({
        code: 5,
        message: 'Commande non trouvée'
      });
    }

    // Publier l'événement
    await publishEvent('order.cancelled', {
      order_id: order.id,
      reason: reason || 'Non spécifié',
      cancelled_at: new Date().toISOString()
    });

    callback(null, {
      order_id: order.id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      pickup_address: order.pickup_address,
      delivery_address: order.delivery_address,
      package_description: order.package_description,
      package_weight: order.package_weight,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at
    });
  } catch (error) {
    console.error('Erreur CancelOrder:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

module.exports = {
  CreateOrder,
  GetOrder,
  ListOrders,
  UpdateOrder,
  CancelOrder
};
