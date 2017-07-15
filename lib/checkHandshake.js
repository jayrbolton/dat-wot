const Dat = require('dat-node')
const fs = require('fs-extra')
const crypto = require('./utils/crypto')
const json = require('./utils/json')
const follow = require('./follow')
const uuid = require('uuid')

// For two users userA and userB who are trying to initiate a relationship
// userA will check if there is a handshake file in userB's public dat
// If the file exists, then validate the signature and decrypt the dat key
// Download the dat and add its key to the relationships array in their user data
// This assumes that userA and userB are both sharing and downloading each others' public dats right now, so they are up-to-date
module.exports = function checkHandshake (userA, key, cb) {
  follow(userA, key, (userA, userB) => {
    const hsFilePath = userA.path + '/follows/' + userB.id + '/handshakes/' + userA.id
    if (!fs.existsSync(hsFilePath)) cb(false)
    const cipher = fs.readFileSync(hsFilePath)
    const nonce = fs.readFileSync(hsFilePath + '-nonce')
    const relKey = crypto.decrypt(cipher, nonce, userB.pubKey, userA.privKey)
    saveRelationship(userA, userB, relKey, cb)
  })
}

// The relationship from userB -> userA has been established --- now userA can save the relationship dat key
function saveRelationship (userA, userB, relKey, cb) {
  const relPath = userA.path + '/relationships/from/' + userB.id
  fs.ensureDirSync(relPath)
  Dat(relPath, {key: relKey}, (err, relDat) => {
    if (err) throw err
    relDat.joinNetwork()
    cb(userA, userB, relDat)
  })
}
