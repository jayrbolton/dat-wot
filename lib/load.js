const fs = require('fs')
const Dat = require('dat-node')
const json = require('./utils/json')

// Load an local, existing metadat user
// This loads all private local data using the given passphrase
module.exports = function load (path, passphrase, cb) {
  if(!fs.existsSync(path)) throw "Path does not exist"
  const user = json.read(path + '/user.json')

  Dat(user.dirs.pub, { key: user.publicMetadatKey }, (err, dat) => {
    if(err) throw err
    cb(user)
  })
}

