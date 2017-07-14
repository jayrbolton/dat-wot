const sodium = require('sodium-universal')

module.exports = {
  uuid: uuid,
  createKeyPair: createKeyPair
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
