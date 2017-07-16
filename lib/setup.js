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
  , name, path
  }

  // Create some basic user directories
  const dirs = [ path, path + '/public', path + '/dats', path + '/follows', path + '/relationships', path + '/public/handshakes' ]
  dirs.forEach(d => fs.ensureDirSync(d))

  // Write an empty json of public dats
  json.write(path + '/public/dats.json', {})
  user.dats = {}

  // generate and write a user ID to their public dir
  user.id = crypto.uuid()
  fs.writeFileSync(path + '/public/id', user.id)

  // Generate their salt and password hash and save to disk
  crypto.registerPass(pass, path, (salt) => {
    crypto.derivePrivKey(pass, salt, (privKey) => {
      // generate the private and public keys
      const pubKey = crypto.createKeyPair(privKey)
      user.pubKey = pubKey
      user.privKey = privKey
      fs.writeFile(path + '/public/pubkey', pubKey, (err) => {
        if (err) throw err
        // Create the dat archive for their public dir
        Dat(path + '/public', (err, dat) => {
          if (err) throw err
          dat.joinNetwork()
          user.publicDat = dat
          importAll(dat, () => callback(user))
        })
      })
    })
  })
}

