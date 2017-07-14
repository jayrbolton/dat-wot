const Dat = require('dat-node')
const fs = require('fs')
const createDir = require('./utils/createDir')
const json = require('./utils/json')
const follow = require('./follow')
const uuid = require('uuid')

// For two users userA and userB who are trying to initiate a relationship
// userA will check if there is a handshake file in userB's public metadat
// If the file exists, then validate the signature and decrypt the dat key
// Download the dat and add its key to the relationships array in their user data
// XXX this assumes that userA and userB are both sharing and downloading each others' public metadats right now, so they are up-to-date
module.exports = function checkHandshake (userA, key, cb) {
  const privateKey = userA.privKey
  const publicKey = userA.pubKey
  follow(userA, key, (userA, userB) => {
    const hsFilePath = userA.dirs.follows + '/' + userB.name + '-' + userB.id + '/handshakes/' + userA.id + '.gpg'
    if (!fs.existsSync(hsFilePath)) cb(false)
    const [cipher, nonce] = fs.readFileSync(hsFilePath, 'utf8').split('\n')
    var result = crypto.decrypt(cipher, nonce, publicKey, privateKey)
    if (!result) throw new error('Could not decrypt', content)
    saveRelationship(userA, userB, result, cb)
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
