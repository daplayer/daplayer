'use strict';

/**
 * Class responsible for managing the listening analytics
 * inside the application.
 *
 * IndexedDB is used under the hood. Checkout the `Database`
 * class for further information. There's a table for each
 * service (i.e. soundcloud, youtube, local).
 *
 * The data are stored as JSON objects with an `id` and
 * `playback_count` field. For instance:
 *
 *     {id: '/path/to/file.mp3', playback_count: 5}
 */
module.exports = class Analytics {
  /**
   * Increases the playback count value of a record inside
   * the database.
   *
   * @param  {Media} record - The concerned record.
   * @return {Promise}
   */
  static increase(record) {
    return Database.analytics.then((db) => {
      return db.table(record.service);
    }).then((table) => {
      return table.fetch(record.id).then((data) => {
        if (!data)
          return this.store(record);

        data.playback_count += 1;

        return table.put(data);
      });
    });
  }

  /**
   * Stores a brand new entry in the analytics database.
   *
   * @param  {Media} record - The record to add.
   * @return {Promise}
   */
  static store(record) {
    return Database.analytics.then((db) => {
      return db.table(record.service);
    }).then((table) => {
      return table.insert({
        id: record.id,
        playback_count: 1
      });
    });
  }
}
