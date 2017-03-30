const sqlite3 = require('sqlite3').verbose()
// SQLite schema -- initialize tables

function init(path) {
  const db = new sqlite3.Database(path)
  db.run(`
    CREATE TABLE users (
      "id" INTEGER PRIMARY KEY NOT NULL
    , "username" TEXT NOT NULL
    , "email" TEXT NOT NULL
    , "name" TEXT NOT NULL
    , "datAddr" TEXT NOT NULL
    )
  `)
  return db
}

module.exports = init
