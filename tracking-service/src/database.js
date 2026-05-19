const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

function initDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '../data/tracking.db');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Créer la table tracking
      db.run(`
        CREATE TABLE IF NOT EXISTS tracking (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL UNIQUE,
          driver_id TEXT NOT NULL,
          current_latitude REAL,
          current_longitude REAL,
          pickup_latitude REAL,
          pickup_longitude REAL,
          delivery_latitude REAL,
          delivery_longitude REAL,
          distance_traveled_km REAL DEFAULT 0,
          distance_remaining_km REAL,
          estimated_minutes INTEGER,
          status TEXT DEFAULT 'TRACKING',
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Créer la table location_history
        db.run(`
          CREATE TABLE IF NOT EXISTS location_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            speed REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
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
  });
}

function getDatabase() {
  return db;
}

// Fonctions CRUD
function createTracking(tracking) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tracking (id, order_id, driver_id, pickup_latitude, pickup_longitude,
                           delivery_latitude, delivery_longitude, distance_remaining_km, estimated_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
      tracking.id,
      tracking.order_id,
      tracking.driver_id,
      tracking.pickup_latitude,
      tracking.pickup_longitude,
      tracking.delivery_latitude,
      tracking.delivery_longitude,
      tracking.distance_remaining_km,
      tracking.estimated_minutes
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tracking);
    });
  });
}

function getTracking(orderId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tracking WHERE order_id = ?';
    db.get(sql, [orderId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function updateLocation(orderId, location, speed) {
  return new Promise((resolve, reject) => {
    // Mettre à jour la position actuelle
    const sql = `
      UPDATE tracking 
      SET current_latitude = ?, 
          current_longitude = ?, 
          last_updated = CURRENT_TIMESTAMP
      WHERE order_id = ?
    `;
    
    db.run(sql, [location.latitude, location.longitude, orderId], function(err) {
      if (err) {
        reject(err);
        return;
      }

      // Ajouter à l'historique
      const historySql = `
        INSERT INTO location_history (order_id, latitude, longitude, speed)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(historySql, [orderId, location.latitude, location.longitude, speed || 0], (err) => {
        if (err) {
          reject(err);
          return;
        }
        getTracking(orderId).then(resolve).catch(reject);
      });
    });
  });
}

function getLocationHistory(orderId, fromTime, toTime) {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM location_history WHERE order_id = ?';
    const params = [orderId];

    if (fromTime) {
      sql += ' AND timestamp >= ?';
      params.push(fromTime);
    }

    if (toTime) {
      sql += ' AND timestamp <= ?';
      params.push(toTime);
    }

    sql += ' ORDER BY timestamp ASC';

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function updateETA(orderId, distanceKm, estimatedMinutes) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tracking 
      SET distance_remaining_km = ?, 
          estimated_minutes = ?,
          last_updated = CURRENT_TIMESTAMP
      WHERE order_id = ?
    `;
    
    db.run(sql, [distanceKm, estimatedMinutes, orderId], function(err) {
      if (err) {
        reject(err);
        return;
      }
      getTracking(orderId).then(resolve).catch(reject);
    });
  });
}

module.exports = {
  initDatabase,
  getDatabase,
  createTracking,
  getTracking,
  updateLocation,
  getLocationHistory,
  updateETA
};
