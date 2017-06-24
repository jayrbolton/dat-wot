const Dat = require('dat-node')
const fs = require('fs')
const createDir = require('./utils/createDir')
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
module.exports = function checkHandshake (userA, key, cb) {
  const privateKey = openpgp.key.readArmored(userA.privKey).keys[0]
  privateKey.decrypt(userA.passphrase)
  const publicKeys = openpgp.key.readArmored(userA.pubKey).keys
  follow(userA, key, (userA, userB) => {
    const hsFilePath = userA.dirs.follows + '/' + userB.name + '-' + userB.id + '/handshakes/' + userA.id + '.gpg'
    if (!fs.existsSync(hsFilePath)) cb(false)
    const content = openpgp.message.readArmored( fs.readFileSync(hsFilePath, 'utf8') )
    const options = { message: content , publicKeys , privateKey }
    openpgp.decrypt(options).then(result => saveRelationship(userA, userB, result.data, cb)).catch(console.error.bind(console))
  })
}

// The relationship from userB -> userA has been established --- now userA can save the relationship dat key
function saveRelationship (userA, userB, relKey, cb) {
  const rel = {
    name: userB.name
  , path: userA.dirs.relationships + userB.name + '-' + userB.id + '/from'
  , key: relKey
  }
  const jsonPath = userA.dirs.base + '/user.json'
  var userJson = json.read(jsonPath)
  userJson.relationships[userB.id] = rel
  json.write(jsonPath, userJson)
  cb(userJson, userB)
}

