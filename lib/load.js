const fs = require('fs')
const Dat = require('dat-node')
const json = require('./utils/json')
const crypto = require('./utils/crypto')
const parallel = require('run-parallel')
const waterfall = require('run-waterfall')

// Load an local, existing user
// This loads all private local data using the given passphrase
module.exports = function load (path, pass, callback) {
  // Read a bunch of data from the filesystem in parallel
  const parallelReads = (cb) => parallel([
    (cb) => fs.readFile(path + '/public/pubkey', cb)
  , (cb) => fs.readFile(path + '/public/id', cb)
  , (cb) => json.read(path + '/public/dats.json', cb)
  , (cb) => fs.readFile(path + '/salt', cb)
  , (cb) => fs.readFile(path + '/pass_hash', cb)
  ], cb)

  let data
  waterfall([
    parallelReads
  , (results, cb) => { // create an object of results -- indexes below correspond to indexes from parallelReads
      data = {
        user: {
          pubKey: results[0]
        , id: results[1]
        , dats: results[2]
        , path
        }
      , salt: results[3]
      , hash: results[4]
      }
      cb(null)
    }
  , (cb) => crypto.verifyPass(data.hash, pass, cb)
  , (validPass, cb) => cb(validPass ? null : new Error("Password invalid"))
  , (cb) => crypto.derivePrivKey(pass, data.salt, cb)
  , (privKey, cb) => {
      data.user.privKey = privKey
      Dat(path + '/public', cb)
    }
  , (dat, cb) => {
      data.user.publicDat = dat
      dat.joinNetwork()
      cb(null, data.user)
    }
  ], callback)
}
