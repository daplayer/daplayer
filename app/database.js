'use strict';

/**
 * Wrapper around IndexedDB.
 */
module.exports = class Database {
  constructor(database) {
    this.database = database;
  }

  table(name) {
    return new Promise((resolve, reject) => {
      resolve(new Table(this.database.transaction(name, 'readwrite')
                                     .objectStore(name)));
    });
  }

  static connect(name, version, schema) {
    return new Promise((resolve, reject) => {
      var request = indexedDB.open(name, version);

      request.onsuccess = function(event) {
        resolve(new Database(this.result));
      };

      request.onerror = function(event) {
        reject(event.target.errorCode);
      };

      request.onupgradeneeded = function(evt) {
        var db = new Database(evt.currentTarget.result);

        schema(db);
        resolve(db);
      };
    });
  }

  static get analytics() {
    if (!this._analytics)
      this._analytics = this.connect('analytics', 2, (db) => {
        ['soundcloud', 'youtube', 'local'].forEach((service) => {
          var store = db.database.createObjectStore(service, { keyPath: 'id' });

          store.createIndex('playback_count', 'playback_count', { unique: false });
        });
      });

    return this._analytics;
  }
}

/**
 * Representation of an IndexedDB table.
 */
class Table {
  constructor(store) {
    this.store = store;
  }

  insert(record) {
    return this.store.add(record);
  }

  put(record) {
    return new Promise((resolve, reject) => {
      var request = this.store.put(record);

      request.onerror   = function(event) { reject(event); }
      request.onsuccess = function(event) { resolve(true);  }
    });
  }

  fetch(id) {
    return new Promise((resolve, reject) => {
      var request = this.store.get(id);

      request.onerror   = function(event) { reject(event); };
      request.onsuccess = function(event) { resolve(event.target.result); };
    });
  }
}
