'use strict';

module.exports = class LocalModelPlaylists {
  static listenLater() {
    return Database.select({
      table:  'records',
      fields: ['*'],
      where:  ['playlist_id = 1']
    });
  }

  static listenLaterTo(address) {
    MetaModel.resolve(address).then((record) => {
      this.addToPlaylist(1, record).then(() => {
        Ui.addListenLaterRecord(record);
      }).catch((e) => {
        console.log(e);
      });
    });
  }

  static playlists() {
    if (Cache.local.playlists)
      return Cache.local.playlists;

    return Database.select({
      table:  'playlists',
      fields: ['*'],
      where:  ['id <> 1']
    }).then((playlists) => {
      var promises = playlists.map((playlist) => {
        return Database.select({
          table:  'records',
          fields: ['*'],
          where:  [`playlist_id = ${playlist.id}`]
        });
      });

      return Promise.all(promises).then((records) => {
        return playlists.map((playlist, index) => {
          let items = records[index];

          playlist.items   = items.map(MetaModel.mapRecords);
          playlist.service = 'local';

          if (!playlist.icon && items.length)
            playlist.icon = records[index][0].icon;

          return Record.local(playlist);
        });
      });
    });
  }

  static addToPlaylist(playlist_id, record) {
    return Database.insert({
      table: 'records',
      values: {
        id:          record.id,
        title:       record.title,
        artist:      record.artist,
        icon:        record.icon,
        human_time:  record.human_time,
        duration:    record.duration,
        service:     record.service,
        playlist_id: playlist_id
      }
    });
  }
}
