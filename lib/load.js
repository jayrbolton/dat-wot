const fs = require('fs')
const Dat = require('dat-node')
const json = require('./utils/json')

// Load an local, existing user
// This loads all private local data using the given passphrase
module.exports = function load (path, passphrase, cb) {
  if(!fs.existsSync(path)) throw "Path does not exist"
  const user = {
    path
  , pubKey: fs.readFileSync(path + '/public/pubkey')
  , privKey: fs.readFileSync(path + '/privkey')
  , id: fs.readFileSync(path + '/public/id')
  , dats: json.read(path + '/public/dats.json')
  }

  Dat(path + '/public', { }, (err, dat) => {
    if(err) throw err
    user.publicDat = dat
    dat.joinNetwork()
    cb(user)
  })
}
