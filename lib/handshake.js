const Dat = require('dat-node')
const fs = require('fs-extra')
const uuid = require('uuid')
const crypto = require('./utils/crypto')
const follow = require('./follow')
const importAll = require('./utils/importAll')
const json = require('./utils/json')
const waterfall = require('run-waterfall')
const parallel = require('run-parallel')

// Initiate a new potential relationship
// userA is initiating a relationship with userB (identified by their public dat key)
// The callback will be be passed the contents of the handshake file
module.exports = function handshake (userA, key, callback) {
  let userB
  const tasks = [
    (cb) => follow(userA, key, cb)
  , (u, cb) => {
      userB = u
      fs.ensureDir(userA.path + '/relationships/' + userB.id, cb)
    }
  , (dir, cb) => json.write(dir + '/dats.json', {}, (err) => cb(err, dir))
  , (dir, cb) => Dat(dir, cb)
  , (dat, cb) => {
      dat.importFiles()
      dat.joinNetwork()
      const result = crypto.encrypt(dat.key, userB.pubKey, userA.privKey)
      const hsFilePath = userA.path + '/public/handshakes/' + userB.id.toString('hex')
      parallel([
        (cb) => fs.writeFile(hsFilePath, result.cipher, cb)
      , (cb) => fs.writeFile(hsFilePath + '-nonce', result.nonce, cb)
      ], (err, results) => cb(err, dat))
    }
  , (dat, cb) => importAll(userA.publicDat, (err) => cb(err, userB, dat))
  ]

  waterfall(tasks, callback)
}
