import sqlite3 from "sqlite3";

async function insertArtist(artist) {
  try {

    // Create a new Promise for data to return asynchronously
    return new Promise((resolve, reject) => {
      // Open the database with READ/WRITE access
      let db = new sqlite3.Database("./db/1chinook.db", sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          reject(err);
        }
        // Run the Insertion Query
        db.run(`
        INSERT INTO artists(Name) VALUES (?)
      `, [artist], (err) => {
          if (err) {
            reject(err)
          } else {
            console.log("Inserted into artists");
          }
        })

        // If no problems, then close the database
        db.close(err => {
          if (err) {
            reject(err);
          } else {
            console.log("(1) Artists Done!")
            resolve();
          };
        })
      });
    })
  } catch (err) {
    console.error(err.message);
  }
}


function insertAlbum(album, artist) {

  try {

    // Create a new Promise for data to return asynchronously
    return new Promise((resolve, reject) => {

      // Open the database with READ/WRITE access
      let db = new sqlite3.Database("./db/1chinook.db", sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          reject(err);
        }
        // First get the ArtistId from the artists table
        let artistId;
        db.get(`
        SELECT artistId
        FROM artists
        WHERE artists.Name = (?)
      `, [artist], (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              artistId = row.ArtistId;
            }
            // Run the Insertion Query
            db.run(`
            INSERT INTO albums(Title, artistId) VALUES (?, ?)
          `, [album, artistId], (err) => {
              if (err) {
                reject(err);
              } else {
                console.log("Inserted into albums");
              }
            })
            // If no problems, then close the database
            db.close(err => {
              if (err) {
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
  } catch (err) {
    console.error(err.message);
  }
}


function insertSong(song, name, composer, milliseconds, unitprice) {
  try {

    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database("./db/1chinook.db", sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          reject(err);
        }
        let albumId;
        db.get(`
        SELECT *
        FROM albums
        WHERE Title = (?)
      `, [name], (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              albumId = row.AlbumId;
            }
            if (!milliseconds) {
              milliseconds = Math.floor(Math.random() * (500000 - 100000 + 1)) + 100000;
            }
            if (!unitprice) {
              unitprice = Math.floor(Math.random() * (5.99 - 0.99 + 1)) + 0.99;
            }

            let randMTI = Math.floor(Math.random() * 5) + 1;
            db.run(`
            INSERT INTO tracks(Name, AlbumId, MediaTypeId, Composer, Milliseconds, UnitPrice)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [song, albumId, randMTI, composer, milliseconds, unitprice], (err) => {
              if (err) {
                reject(err);
              } else {
                console.log("Inserted into tracks");
              }
            })
            db.close(err => {
              if (err) {
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
  } catch (err) {
    console.error(err.message);
  }
}


export async function addData(title, album, artist, composer, milliseconds, unitprice) {
  try {
    // Open the database with READ/WRITE access
    let db = new sqlite3.Database("./db/1chinook.db", sqlite3.OPEN_READWRITE);

    // Create a new Promise for data to return asynchronously
    let row = await new Promise((resolve, reject) => {
      // Check if data already exists in the database
      db.get(`
        SELECT artists.Name, albums.Title, tracks.Name
        FROM albums
        JOIN artists USING (ArtistId)
        JOIN tracks USING (AlbumId)
        WHERE artists.Name = ?
          AND albums.Title = ?
          AND tracks.Name = ?
      `, [artist, album, title], (err, row) => {
        if (err) {
          reject(err);
        }
        // If no problems, finally return the row
        resolve(row);
      });
    });

    // If row exists, output then exit
    if (row) {
      console.log("There is already an existing data of the inputted values");
    } else { // else run these insertion functions
      await insertArtist(artist);
      await insertAlbum(album, artist);
      await insertSong(title, album, composer, milliseconds, unitprice);
      console.log("Insertion Complete!");
    }

    // If no problems, then close the database
    db.close((err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Add Data Done!");
      }
    });
  } catch (err) { // If there are any errors, catch those and output
    console.error(err);
  }
}


export async function allData() {

  try {

    // Create a new Promise for data to return asynchronously
    return new Promise((resolve, reject) => {

      // Open the database with READ access
      let db = new sqlite3.Database("./db/1chinook.db", sqlite3.OPEN_READ);

      // Query the needed information
      db.all(`
        SELECT ArtistId, artists.Name as Artist, albums.Title as Album, tracks.Name as Song, tracks.Composer, tracks.Milliseconds, tracks.UnitPrice
        FROM albums
        JOIN artists USING (ArtistId)
        JOIN tracks USING (AlbumId)
        ORDER BY ArtistId ASC, AlbumId ASC, Song ASC
    `, (err, rows) => {
        // If there are errors in the querying process
        if (err) {
          res.status(500).send("500 Internal Server Error");
          reject(err);
        } else {
          db.close((err) => {
            // If there are errors in the closing process
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        }
      })
    })
  } catch {
    console.error(err);
  }
}


// SELECT * FROM albums JOIN artists USING (ArtistId) JOIN tracks USING (AlbumId) WHERE tracks.Name = ?


export async function searchData(item) {
  try {
    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database("./db/1chinook.db", sqlite3.OPEN_READ);

      db.all(`
        SELECT ArtistId, artists.Name as Artist, albums.Title as Album, tracks.Name as Song, tracks.Composer, tracks.Milliseconds, tracks.UnitPrice
        FROM albums
        JOIN artists USING (ArtistId)
        JOIN tracks USING (AlbumId)
        WHERE  Artist LIKE ?
            OR Album LIKE ?
            OR Song LIKE ?
        ORDER BY ArtistId
      `, [`%${item}%`, `%${item}%`, `%${item}%`], (err, rows) => {
        if (err) {
          res.status(500).send("500 Internal Server Error");
          reject(err);
        } else {
          db.close((err) => {
            // If there are errors in the closing process
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        }
      })
    })
  } catch {
    console.error(err);
  }

}
