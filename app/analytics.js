'use strict';

module.exports = class Analytics {
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
