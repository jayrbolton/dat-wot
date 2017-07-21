const Dat = require('dat-node')
const fs = require('fs-extra')
const uuid = require('uuid')
const crypto = require('./utils/crypto')
const follow = require('./follow')
const importAll = require('./utils/importAll')
const json = require('./utils/json')

// Initiate a new potential relationship
// userA is initiating a relationship with userB (identified by their public dat key)
// The callback will be be passed the contents of the handshake file
module.exports = function handshake (userA, key, callback) {
  // First, make sure userA is following userB (ie has a copy of their public dat)
  follow(userA, key, (userA, userB) => {
    // Create a new dat to send private data from userA to userB
    // Encrypt the dat address using userB's pubkey, signed by userA
    const dir = userA.path + '/relationships/' + userB.id
    fs.ensureDirSync(dir)
    Dat(dir, (err, dat) => {
      if(err) throw err
      const result = crypto.encrypt(dat.key, userB.pubKey, userA.privKey)
      // Write the the ciphertext to userA's handshakes directory with userB's id as the filename
      const hsFilePath = userA.path + '/public/handshakes/' + userB.id.toString('hex')
      fs.writeFileSync(hsFilePath, result.cipher)
      json.write(hsFilePath + '/dats.json', {})
      fs.writeFileSync(hsFilePath + '-nonce', result.nonce)
      dat.joinNetwork()
      dat.importFiles({watch: true})
      importAll(userA.publicDat, () => callback(userA, userB, dat))
    })
  })
}
