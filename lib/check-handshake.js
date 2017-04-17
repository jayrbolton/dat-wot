const Dat = require('dat-node')
const fs = require('fs')
const createDir = require('./utils/create-dir')
const json = require('./utils/json')
const follow = require('./follow')
const openpgp = require('openpgp')
const uuid = require('uuid')
openpgp.config.aead_protect = true

// For two users userA and userB who are trying to initiate a relationship
// userA will check if there is a handshake file in userB's public metadat
// If the file exists, then validate the signature and decrypt the dat key
// Download the dat and add its key to the relationships array in their user data
// XXX this assumes that userA and userB are both sharing and downloading each others' public metadats right now, so they are up-to-date
function check(userA, userB, cb) {
  console.log('checkkkin', userB.id)
  // load the encrypted handshake file from userB
  const hsFilePath = userA.dirs.follows + '/' + userB.id + '/.handshakes/' + userA.id + '.txt'
  const str = fs.readFileSync(hsFilePath)
  console.log({str})
    /*
  follow(userA, userB, (dat) => {
    dat.joinNetwork((err) => {
      if(err) throw err
      cb(dat)
    })
  })
  */
}

module.exports = check
