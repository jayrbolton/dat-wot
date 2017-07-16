const Dat = require('dat-node')
const fs = require('fs-extra')
const crypto = require('./utils/crypto')
const json = require('./utils/json')
const follow = require('./follow')
const uuid = require('uuid')

// For two users userB and userA who are trying to initiate a relationship
// userA has has already initialized a handshake with userB using `handshake`
// userB can now check for the handshake file in userA's public dat
// If the file exists, then validate the signature and decrypt the dat key
// Download the dat and add save the relationship dat key
// This assumes that userA and userB are both sharing and downloading each others' public dats right now, so they are up-to-date
//
// Note: userB is checking the handshake *from* userA. `key` is the publicDat key from userA
module.exports = function checkHandshake (userB, key, cb) {
  follow(userB, key, (userB, userA) => {
    const hsFilePath = userB.path + '/follows/' + userA.id + '/handshakes/' + userB.id
    if (!fs.existsSync(hsFilePath)) cb(false)
    const cipher = fs.readFileSync(hsFilePath)
    const nonce = fs.readFileSync(hsFilePath + '-nonce')
    const relKey = crypto.decrypt(cipher, nonce, userA.pubKey, userB.privKey)
    saveRelationship(userB, userA, relKey, cb)
  })
}

// The relationship from userA -> userB has been established --- now userB can save the relationship dat key
function saveRelationship (userB, userA, relKey, cb) {
  const relPath = userB.path + '/relationships/from/' + userA.id
  fs.ensureDirSync(relPath)
  Dat(relPath, {key: relKey}, (err, relDat) => {
    if (err) throw err
    relDat.joinNetwork()
    cb(userB, userA, relDat)
  })
}
