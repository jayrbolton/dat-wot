const fs = require('fs')
const Dat = require('dat-node')
const json = require('./utils/json')

// Load an existing metadat user
function load(path, passphrase, cb) {
  if(!fs.existsSync(path)) throw "Path does not exist"
  const user = json.read(path + '/user.json')

  Dat(path + '/' + user.id, { key: user.publicMetadatKey }, (err, dat) => {
    if(err) throw err
    cb(user)
  })
}

module.exports = load
