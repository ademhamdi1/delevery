const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

function initDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '../data/orders.db');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Créer la table orders
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          pickup_address TEXT NOT NULL,
          delivery_address TEXT NOT NULL,
          package_description TEXT,
          package_weight REAL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

function getDatabase() {
  return db;
}

// Fonctions CRUD
function createOrder(order) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO orders (id, customer_name, customer_phone, pickup_address, 
                         delivery_address, package_description, package_weight, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
      order.id,
      order.customer_name,
      order.customer_phone,
      order.pickup_address,
      order.delivery_address,
      order.package_description,
      order.package_weight,
      order.status
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(order);
    });
  });
}

function getOrder(orderId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM orders WHERE id = ?';
    db.get(sql, [orderId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function listOrders(page = 1, limit = 10, status = null) {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM orders';
    let params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // Compter le total
      let countSql = 'SELECT COUNT(*) as total FROM orders';
      if (status) {
        countSql += ' WHERE status = ?';
        db.get(countSql, status ? [status] : [], (err, countRow) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ orders: rows, total: countRow.total });
        });
      } else {
        db.get(countSql, [], (err, countRow) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ orders: rows, total: countRow.total });
        });
      }
    });
  });
}

function updateOrder(orderId, updates) {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    if (updates.status) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.delivery_address) {
      fields.push('delivery_address = ?');
      values.push(updates.delivery_address);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(orderId);

    const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function(err) {
      if (err) {
        reject(err);
        return;
      }
      getOrder(orderId).then(resolve).catch(reject);
    });
  });
}

function cancelOrder(orderId) {
  return updateOrder(orderId, { status: 'CANCELLED' });
}

module.exports = {
  initDatabase,
  getDatabase,
  createOrder,
  getOrder,
  listOrders,
  updateOrder,
  cancelOrder
};
