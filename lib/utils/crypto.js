const sodium = require('sodium-universal')

module.exports = {
  uuid: uuid,
  createKeyPair: createKeyPair,
  encrypt: encrypt
}

function uuid () {
  const id = sodium.malloc(16)
  sodium.randombytes_buf(id)
  sodium.mlock(id)
  return id
}

// use libsodium to generate a keypair
function createKeyPair () {
  const pubKey = sodium.malloc(sodium.crypto_box_PUBLICKEYBYTES)
  const privKey = sodium.malloc(sodium.crypto_box_SECRETKEYBYTES)
  sodium.crypto_box_keypair(pubKey, privKey)
  sodium.mlock(pubKey)
  sodium.mlock(privKey)
  return [pubKey, privKey]
}

function encrypt (message, publicKey, secretKey) {
  // encrypted message is stored in cipher.
  if (!Buffer.isBuffer(message)) message = new Buffer(message)
  var cipher = sodium.malloc(message.length + sodium.crypto_box_MACBYTES)
  var nonce = sodium.malloc(sodium.crypto_box_NONCEBYTES)
  sodium.crypto_box_easy(cipher, message, nonce, publicKey, secretKey)
  return {cipher, nonce}
}

function decrypt (cipher, nonce, publicKey, secretKey) {
  if (!Buffer.isBuffer(cipher)) cipher = new Buffer(cipher, 'hex')
  if (!Buffer.isBuffer(nonce)) nonce = new Buffer(nonce, 'hex')
  var message = sodium.malloc(cipher.length - sodium.crypto_box_MACBYTES)
  if (!sodium.crypto_box_open_easy(message, cipher, nonce, publicKey, secretKey)) return false
  return message
}
