const fs    = require('fs');
const Paths = require('./paths');
const SQL   = require('sql.js');

module.exports = class Database {
  static get connection() {
    if (!this.database) {
      var filebuffer = fs.readFileSync(Paths.database);
      this.database  = new SQL.Database(filebuffer);
    }

    return this.database;
  }

  static select(hash) {
    return new Promise((resolve, reject) => {
      var sql = `SELECT ${hash.fields.join(', ')} FROM ${hash.table}`;

      if (hash.where)
        sql = sql.concat(` WHERE ${hash.where.join(' AND ')}`);

      var result = this.connection.exec(sql)[0];

      if (result)
        resolve(result.values.map((record) => {
          let object = {};

          result.columns.forEach((column, i) => {
            object[column] = record[i];
          });

          return object;
        }));
      else
        resolve([]);
    });
  }

  static insert(hash) {
    return new Promise((resolve, reject) => {
      var keys   = [];
      var values = [];
      var sql    = `INSERT INTO ${hash.table}(`;

      for (var key in hash.values) {
        keys.push(key);
        values.push(hash.values[key]);
      }

      sql = sql.concat(keys.join(', '));
      sql = sql.concat(') VALUES("');
      sql = sql.concat(values.join('", "'));
      sql = sql.concat('")');

      try {
        this.connection.run(sql);

        var data   = this.connection.export();
        var buffer = new Buffer(data);

        fs.writeFileSync(Paths.database, buffer);

        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }
}
