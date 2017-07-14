const fs = require('fs')
const Dat = require('dat-node')
const json = require('./utils/json')

// Load an local, existing metadat user
// This loads all private local data using the given passphrase
module.exports = function load (path, passphrase, cb) {
  if(!fs.existsSync(path)) throw "Path does not exist"
  const user = json.read(path + '/user.json')
  user.pubKey = new Buffer(fs.readFileSync(path + '/public/pubkey'), 'hex')
  user.privKey = new Buffer(fs.readFileSync(path + '/privkey'), 'hex')
  user.id = new Buffer(fs.readFileSync(path + '/public/id'), 'hex')

  Dat(path + '/public', { key: user.publicMetadatKey }, (err, dat) => {
    if(err) throw err
    user.publicMetadat = dat
    cb(user)
  })
}

