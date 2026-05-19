const { getOrderClient, getDeliveryClient, getTrackingClient } = require('../grpc/clients');

// Schéma GraphQL
const typeDefs = `#graphql
  type Location {
    latitude: Float!
    longitude: Float!
  }

  type Order {
    order_id: String!
    customer_name: String!
    customer_phone: String!
    pickup_address: String!
    delivery_address: String!
    package_description: String
    package_weight: Float
    status: String!
    created_at: String!
    updated_at: String!
    delivery: Delivery
    tracking: Tracking
  }

  type Driver {
    driver_id: String!
    name: String!
    phone: String!
    vehicle_type: String!
    vehicle_plate: String!
    is_available: Boolean!
    current_location: Location
    rating: Float
    total_deliveries: Int
  }

  type Delivery {
    delivery_id: String!
    order_id: String!
    driver: Driver!
    status: String!
    current_location: Location
    assigned_at: String!
    picked_up_at: String
    delivered_at: String
  }

  type Tracking {
    tracking_id: String!
    order_id: String!
    current_location: Location
    pickup_location: Location!
    delivery_location: Location!
    distance_traveled_km: Float!
    distance_remaining_km: Float!
    estimated_minutes: Int!
    status: String!
    last_updated: String!
  }

  type Query {
    order(id: String!): Order
    orders(page: Int, limit: Int, status: String): [Order!]!
    delivery(orderId: String!): Delivery
    availableDrivers: [Driver!]!
    driver(id: String!): Driver
    tracking(orderId: String!): Tracking
  }

  type Mutation {
    createOrder(
      customer_name: String!
      customer_phone: String!
      pickup_address: String!
      delivery_address: String!
      package_description: String
      package_weight: Float
    ): Order!

    assignDriver(order_id: String!, driver_id: String): Delivery!

    updateDeliveryStatus(
      order_id: String!
      status: String!
      current_location: LocationInput
    ): Delivery!

    updateLocation(
      order_id: String!
      current_location: LocationInput!
      speed: Float
    ): Tracking!
  }

  input LocationInput {
    latitude: Float!
    longitude: Float!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    order: (_, { id }) => {
      return new Promise((resolve, reject) => {
        const client = getOrderClient();
        client.GetOrder({ order_id: id }, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
      });
    },

    orders: (_, { page = 1, limit = 10, status }) => {
      return new Promise((resolve, reject) => {
        const client = getOrderClient();
        client.ListOrders({ page, limit, status: status || '' }, (error, response) => {
          if (error) reject(error);
          else resolve(response.orders);
        });
      });
    },

    delivery: (_, { orderId }) => {
      return new Promise((resolve, reject) => {
        const client = getDeliveryClient();
        client.GetDelivery({ order_id: orderId }, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
      });
    },

    availableDrivers: () => {
      return new Promise((resolve, reject) => {
        const client = getDeliveryClient();
        client.ListAvailableDrivers({}, (error, response) => {
          if (error) reject(error);
          else resolve(response.drivers);
        });
      });
    },

    driver: (_, { id }) => {
      return new Promise((resolve, reject) => {
        const client = getDeliveryClient();
        client.GetDriver({ driver_id: id }, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
      });
    },

    tracking: (_, { orderId }) => {
      return new Promise((resolve, reject) => {
        const client = getTrackingClient();
        client.GetCurrentLocation({ order_id: orderId }, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
      });
    }
  },

  Mutation: {
    createOrder: (_, args) => {
      return new Promise((resolve, reject) => {
        const client = getOrderClient();
        client.CreateOrder(args, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
      });
    },

    assignDriver: (_, { order_id, driver_id }) => {
      return new Promise((resolve, reject) => {
        const client = getDeliveryClient();
        client.AssignDriver({ order_id, driver_id }, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
      });
    },

    updateDeliveryStatus: (_, { order_id, status, current_location }) => {
      return new Promise((resolve, reject) => {
        const client = getDeliveryClient();
        client.UpdateDeliveryStatus({ order_id, status, current_location }, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
      });
    },

    updateLocation: (_, { order_id, current_location, speed }) => {
      return new Promise((resolve, reject) => {
        const client = getTrackingClient();
        client.UpdateLocation({ order_id, current_location, speed }, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
      });
    }
  },

  Order: {
    delivery: (parent) => {
      return new Promise((resolve, reject) => {
        const client = getDeliveryClient();
        client.GetDelivery({ order_id: parent.order_id }, (error, response) => {
          if (error) resolve(null); // Pas de livraison assignée
          else resolve(response);
        });
      });
    },

    tracking: (parent) => {
      return new Promise((resolve, reject) => {
        const client = getTrackingClient();
        client.GetCurrentLocation({ order_id: parent.order_id }, (error, response) => {
          if (error) resolve(null); // Pas de tracking
          else resolve(response);
        });
      });
    }
  },

  Delivery: {
    driver: (parent) => {
      return new Promise((resolve, reject) => {
        const client = getDeliveryClient();
        client.GetDriver({ driver_id: parent.driver_id }, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
      });
    }
  }
};

module.exports = { typeDefs, resolvers };
