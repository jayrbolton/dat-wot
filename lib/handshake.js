const Dat = require('dat-node')
const fs = require('fs')
const uuid = require('uuid')
const createDir = require('./utils/createDir')
const crypto = require('./utils/crypto')
const follow = require('./follow')

// Initiate a new potential relationship
// userA is initiating a relationship with userB (identified by their public metadat key)
// The callback will be be passed the contents of the handshake file
module.exports = function handshake (userA, key, cb) {
  // First, make sure userA is following userB (ie has a copy of their public metadat)
  follow(userA, key, (userA, userB) => {
    // Create a new metadat to send private data from userA to userB
    // Encrypt the dat address using userB's pubkey, signed by userA
    const dir = userA.dirs.base + '/relationships/' + userB.name + '-' + userB.id
    createDir(dir)
    Dat(dir, (err, dat) => {
      if(err) throw err
      const datKey = dat.key.toString('hex')
      var result = crypto.encrypt(datKey, userB.pubKey, userA.privKey)
      // Write the the ciphertext to userA's handshakes directory with userB's id as the filename
      const handshakeFilename = userA.dirs.handshakes + '/' + userB.id
      fs.writeFileSync(handshakeFilename, result.cipher.toString('hex') + '\n' + result.nonce.toString('hex'))
      cb(dat, userA, userB)
    })
  })
}
