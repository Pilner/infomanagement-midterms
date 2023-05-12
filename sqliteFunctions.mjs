import sqlite3 from "sqlite3";

function insertAlbum(album, artist) {
  return new Promise((resolve, reject) => {

    let db = new sqlite3.Database("./db/1chinook.db", sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }
      let artistId;
      db.get(`select artistId from artists where artists.Name = (?)`, [artist], (err, row) => {
        if (err) {
          console.err(err.message);
        } else {
          if (row) {
            artistId = row.ArtistId;
          }
          db.run(`
    insert into albums(Title, artistId) values (?, ?)
  `, [album, artistId], (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log(`Inserted into albums`);
            }
          })
          db.close(err => {
            if (err) {
              console.error(err.message);
              reject(err);
            } else {
              console.log("(2) Albums Done!")
              resolve();
            };
          })
        }
      })
    });
  })
}

function insertSong(song, name) {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("./db/1chinook.db", sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }
      let albumId;
      db.get(`select * from albums where Title = (?)`, [name], (err, row) => {
        if (err) {
          console.error(err);
        } else {
          if (row) {
            albumId = row.AlbumId;
          }

          let randMTI = Math.floor(Math.random() * 5) + 1;
          let randMS = Math.floor(Math.random() * (500000 - 100000 + 1)) + 100000;
          let randUP = Math.floor(Math.random() * (5.99 - 0.99 + 1)) + 0.99;
          db.run(`
    insert into tracks(Name, AlbumId, MediaTypeId, Milliseconds, UnitPrice) values (?, ?, ?, ?, ?)
  `, [song, albumId, randMTI, randMS, randUP], (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log(`Inserted into tracks`);
            }
          })
          db.close(err => {
            if (err) {
              console.error(err.message);
              reject(err);
            } else {
              console.log("(3) Tracks Done!")
              resolve();
            };
          })
        }
      })



    });
  })
}

async function insertArtist(artist) {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database("./db/1chinook.db", sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
      }
      db.run(`
    insert into artists(Name) values (?)
  `, [artist], (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Inserted into artists`);
        }
      })
      db.close(err => {
        if (err) {
          console.error(err.message);
        } else {
          console.log("(1) Artists Done!")
          resolve();
        };
      })
    });
  })
}

export async function addData(title, album, artist) {
  try {
    let db = new sqlite3.Database("./db/1chinook.db", sqlite3.OPEN_READWRITE);

    let row = await new Promise((resolve, reject) => {
      db.get(`
        SELECT artists.Name, albums.Title, tracks.Name
        FROM albums
        JOIN artists USING (ArtistId)
        JOIN tracks USING (AlbumId)
        WHERE Artists.Name = ?
          AND albums.Title = ?
          And tracks.Name = ?
      `, [artist, album, title], (err, row) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(row);
      });
    });

    if (row) {
      console.log("There is already an existing data of the inputted values");

    } else {
      await insertArtist(artist);
      await insertAlbum(album, artist);
      await insertSong(title, album);
      console.log("Insertion Complete!");
    }

    db.close((err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Add Data Done!");
      }
    });

  } catch (err) {
    console.error(err.message);
  }
}


// SELECT * FROM albums JOIN artists USING (ArtistId) JOIN tracks USING (AlbumId) WHERE tracks.Name = ?
