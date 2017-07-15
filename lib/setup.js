const fs = require('fs-extra')
const Dat = require('dat-node')
const crypto = require('./utils/crypto')
const json = require('./utils/json')
const importAll = require('./utils/importAll')

// Setup a new user
module.exports = function setup ({path, name, pass}, callback) {
  callback = callback || function (){}
  var user = {
    createdAt: new Date()
  , name, pass, path
  }

  // Create some basic user directories
  const dirs = [ path, path + '/public', path + '/dats', path + '/follows', path + '/relationships', path + '/public/handshakes' ]
  dirs.forEach(d => fs.ensureDirSync(d))

  json.write(path + '/public/dats.json', {})
  user.dats = {}

  // generate and write a user ID to their public dir
  user.id = crypto.uuid()
  fs.writeFileSync(path + '/public/id', user.id)

  // generate the private and public keys
  const [pubKey, privKey] = crypto.createKeyPair()
  user.pubKey = pubKey
  user.privKey = privKey
  fs.writeFileSync(path + '/public/pubkey', pubKey)
  fs.writeFileSync(path + '/privkey', privKey)

  // Create the dat archive for their public dir
  Dat(path + '/public', (err, dat) => {
    if (err) throw err
    dat.joinNetwork()
    importAll(dat, () => callback(user))
    user.publicDat = dat
  })
}

