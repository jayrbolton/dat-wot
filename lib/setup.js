const fs = require('fs-extra')
const Dat = require('dat-node')
const crypto = require('./utils/crypto')
const json = require('./utils/json')
const importAll = require('./utils/importAll')
const waterfall = require('run-waterfall')
const parallel = require('run-parallel')

// Setup a new user
module.exports = function setup ({path, name, pass}, callback) {
  var user = {name, path, dats: {}, id: crypto.uuid() }

  // Note: ensureDir passes (err, path) to its callback

  // Sequential tasks to set up the user:
  const tasks = [
    (cb) => fs.ensureDir(path, cb)
  , (_, cb) => fs.ensureDir(path + '/public', cb)
  , (_, cb) => parallel(pubTasks, (err, results) => cb(err, results[0])) // see pubTasks below. call the callback with the first result, which is the result from the last task of cryptoTask (results[0] will be the user object)
  ]

  // User's crypto and Dat setup tasks (sequential)
  const cryptoTasks = [
    (cb) => crypto.registerPass(pass, path, cb)
  , (salt, cb) => crypto.derivePrivKey(pass, salt, cb)
  , (privKey, cb) => {
      user.pubKey = crypto.createKeyPair(privKey)
      user.privKey = privKey
      fs.writeFile(path + '/public/pubkey', user.pubKey, cb)
    }
  , (cb) => Dat(path + '/public', cb)
  , (dat, cb) => {
      dat.joinNetwork()
      user.publicDat = dat
      importAll(dat, (err) => cb(err, user))
    }
  ]

  // Parallel tasks after the root public directories are created:
  const pubTasks = [
    (cb) => waterfall(cryptoTasks, cb)
  , (cb) => json.write(path + '/public/dats.json', {}, cb)
  , (cb) => fs.writeFile(path + '/public/id', user.id, cb)
  , (cb) => fs.ensureDir(path + '/public/handshakes', cb)
  , (cb) => fs.ensureDir(path + '/dats', cb)
  , (cb) => fs.ensureDir(path + '/follows', cb)
  , (cb) => fs.ensureDir(path + '/relationships', cb)
  , (cb) => fs.ensureDir(path + '/public/handshakes', cb)
  ]

  waterfall(tasks, callback)
}

