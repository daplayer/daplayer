const fs    = require('fs');
const Paths = require('./paths');
const SQL   = require('sql.js');

module.exports = class Database {
  /**
   * Creates a connection to the database if it doesn't
   * exist or returns it otherwise.
   *
   * @return {SQL.Database}
   */
  static get connection() {
    if (!this.database) {
      var filebuffer = fs.readFileSync(Paths.database);
      this.database  = new SQL.Database(filebuffer);
    }

    return this.database;
  }

  /**
   * Builds a `SELECT` SQL query based on the given hash.
   *
   * The hash have the following fields:
   *
   *  - `table`: The table to run the request against.
   *  - `fields`: An array of fields to select.
   *  - `where` (Optional): An array of conditions to meet.
   *
   * @param  {Object} hash
   * @return {Promise}
   */
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

  /**
   * Buils an `INSERT` SQL query based on the given hash.
   *
   * The hash have the following fields:
   *
   * - `table`: The table to run the request against.
   * - `values`: A hash containing field/value sets (e.g.
   *             `{title: 'Maliblue'}`).
   *
   * @param  {Object} hash
   * @return {Promise}
   */
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
        this.saveDB();

        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Sets up the schema in the database, erases the database
   * file if it exists.
   *
   * @return {null}
   */
  static bootstrap() {
    fs.writeFileSync(Paths.database, '');

    var create_table_playlists = `CREATE TABLE playlists(
                                    id    INTEGER PRIMARY KEY AUTOINCREMENT,
                                    title VARCHAR(150),
                                    icon  TEXT
                                  )`;
    var create_table_records   = `CREATE TABLE records (
                                    id          TEXT,
                                    title       VARCHAR(150),
                                    artist      VARCHAR(50),
                                    icon        TEXT,
                                    human_time  VARCHAR(7),
                                    duration    SMALLINT,
                                    service     VARCHAR(20),
                                    playlist_id INTEGER,

                                    FOREIGN KEY(playlist_id) REFERENCES playlist(id)
                                  )`;
    var insert_listen_later     = `INSERT INTO playlists(id, title) VALUES(1, 'Listen Later')`;

    try {
      this.connection.run(create_table_playlists);
      this.connection.run(create_table_records);
      this.connection.run(insert_listen_later);

      this.saveDB();
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Writes the database file to disk.
   *
   * @return {null}
   */
  static saveDB() {
    var data   = this.connection.export();
    var buffer = new Buffer(data);

    fs.writeFileSync(Paths.database, buffer);
  }
}
