const fs = require('fs')
const Dat = require('dat-node')
const json = require('./utils/json')
const crypto = require('./utils/crypto')

// Load an local, existing user
// This loads all private local data using the given passphrase
module.exports = function load (path, pass, callback) {
  if(!fs.existsSync(path)) throw "Path does not exist"

  const user = {
    path
  , pubKey: fs.readFileSync(path + '/public/pubkey')
  , id: fs.readFileSync(path + '/public/id')
  , dats: json.read(path + '/public/dats.json')
  }

  const salt = fs.readFileSync(path + '/salt')
  const hash = fs.readFileSync(path + '/pass_hash')

  crypto.verifyPass(hash, pass, (result) => {
    if (!result) return callback(new Error("Password invalid"), user)
    crypto.derivePrivKey(pass, salt, (privKey) => {
      Dat(path + '/public', { }, (err, dat) => {
        if(err) throw err
        user.publicDat = dat
        user.privKey = privKey
        dat.joinNetwork()
        callback(user)
      })
    })
  })
}
