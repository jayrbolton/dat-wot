const sodium = require('sodium-universal')

module.exports = {
  uuid: uuid,
  createKeyPair: createKeyPair,
  decrypt: decrypt,
  encrypt: encrypt
}

function uuid () {
  const id = sodium.malloc(16)
  sodium.randombytes_buf(id)
  sodium.mlock(id)
  return id.toString('hex')
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

// Encrypt a message from userA to userB
// pass in the buffer for userA's privKey to authenticate
// pass in the buffer for userB's pubKey to encrypt
function encrypt (message, publicKey, secretKey) {
  // encrypted message is stored in cipher.
  const cipher = sodium.malloc(message.length + sodium.crypto_box_MACBYTES)
  const nonce = sodium.malloc(sodium.crypto_box_NONCEBYTES)
  sodium.crypto_box_easy(cipher, message, nonce, publicKey, secretKey)
  sodium.mlock(cipher)
  sodium.mlock(nonce)
  return {cipher, nonce}
}

// Decrypt a message from userA to userB
// pass in the buffer for userA's pubKey to authenticate
// pass in the buffer from userB's privKey to decrypt
function decrypt (cipher, nonce, publicKey, secretKey) {
  const message = sodium.malloc(cipher.length - sodium.crypto_box_MACBYTES)
  const success = sodium.crypto_box_open_easy(message, cipher, nonce, publicKey, secretKey)
  if (!success) throw new Error("Unable to decrypt message")
  return message
}
