const fs = require('fs-extra')
const Dat = require('dat-node')
const crypto = require('./utils/crypto')
const json = require('./utils/json')
const waterfall = require('run-waterfall')
const parallel = require('run-parallel')

// Setup a new local user
module.exports = function setup ({path, name, pass}, callback) {
  const uuid = crypto.uuid()
  let user = {name, path, dats: {}, pushRelDats: {}, pullRelDats: {}, follows: {}, id: uuid}

  // User's crypto and Dat setup tasks (sequential)
  const cryptoTasks = [
    (cb) => crypto.registerPass(pass, path, cb),
    (salt, cb) => crypto.derivePrivKey(pass, salt, cb),
    (privKey, cb) => {
      user.pubKey = crypto.createKeyPair(privKey)
      user.privKey = privKey
      fs.writeFile(path + '/public/pubkey', user.pubKey, cb)
    },
    (cb) => Dat(path + '/public', cb),
    (dat, cb) => {
      dat.joinNetwork()
      user.publicDat = dat
      dat.importFiles((err) => cb(err, user))
    }
  ]

  // Parallel tasks after the root public directories are created:
  const pubTasks = [
    (cb) => waterfall(cryptoTasks, cb),
    (cb) => json.write(path + '/public/dats.json', {}, cb),
    (cb) => fs.writeFile(path + '/public/id', user.id, cb),
    (cb) => fs.ensureDir(path + '/public/handshakes', cb),
    (cb) => fs.ensureDir(path + '/dats', cb),
    (cb) => fs.ensureDir(path + '/follows', cb),
    (cb) => fs.ensureDir(path + '/relationships', cb),
    (cb) => fs.ensureDir(path + '/public/handshakes', cb)
  ]

  waterfall([
    (cb) => fs.ensureDir(path, cb),
    (_, cb) => fs.ensureDir(path + '/public', cb),
    (_, cb) => parallel(pubTasks, (err, results) => cb(err, results[0]))
  ], callback)
}
