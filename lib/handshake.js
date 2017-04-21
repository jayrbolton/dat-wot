const Dat = require('dat-node')
const fs = require('fs')
const createDir = require('./utils/createDir')
const openpgp = require('openpgp')
const uuid = require('uuid')
const follow = require('./follow')
openpgp.config.aead_protect = true

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
    const publicKeys = openpgp.key.readArmored(userB.pubKey).keys
    const privateKeys = openpgp.key.readArmored(userA.privKey).keys[0].decrypt('') //userA.passphrase)
    Dat(dir, (err, dat) => {
      if(err) throw err
      const datKey = dat.key.toString('hex')
      dat.close()
      const options = { data: datKey , publicKeys , privateKeys }
      openpgp.encrypt(options).then((ciphertext) => {
        encrypted = ciphertext.data
        // Write the the ciphertext to userA's handshakes directory with userB's id as the filename
        const handshakeFilename = userA.dirs.handshakes + '/' + userB.id + '.gpg'
        fs.writeFileSync(handshakeFilename, ciphertext.data)
        cb(userA, userB)
      }).catch(console.error.bind(console) )
    })
  })
}

