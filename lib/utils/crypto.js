const sodium = require('sodium-universal')
const fs = require('fs-extra')
const waterfall = require('run-waterfall')

module.exports = {uuid, createKeyPair, decrypt, encrypt, createKeyPair, registerPass, derivePrivKey, verifyPass}

function uuid () {
  const id = sodium.malloc(16)
  sodium.randombytes_buf(id)
  sodium.mlock(id)
  return id.toString('hex')
}

// Given a passhprase, hash it and save the hash to disk
// also save a salt for the user's private key in their keypair
function registerPass (pass, path, callback) {
  const output = sodium.malloc(sodium.crypto_pwhash_STRBYTES)
  const salt = sodium.malloc(sodium.crypto_pwhash_SALTBYTES)
  const password = new Buffer(pass)
  const memlimit = sodium.crypto_pwhash_MEMLIMIT_SENSITIVE
  const opslimit = sodium.crypto_pwhash_OPSLIMIT_SENSITIVE
  sodium.randombytes_buf(salt)
  sodium.mlock(salt)

  const tasks = [
    (cb) => fs.writeFile(path + '/salt', salt, cb)
  , (cb) => sodium.crypto_pwhash_str_async(output, password, opslimit, memlimit, cb)
  , (cb) => {
      sodium.mlock(output)
      fs.writeFile(path + '/pass_hash', output, err => cb(err, salt))
    }
  ]

  waterfall(tasks, callback)
}

// Derive the user's private key for their key-pair using their passphrase and salt
function derivePrivKey (pass, salt, callback) {
  const output = sodium.malloc(sodium.crypto_box_SECRETKEYBYTES)
  const password = new Buffer(pass)
  const memlimit = sodium.crypto_pwhash_MEMLIMIT_SENSITIVE
  const opslimit = sodium.crypto_pwhash_OPSLIMIT_SENSITIVE
  const algorithm = sodium.crypto_pwhash_ALG_DEFAULT
  waterfall([
    (cb) => sodium.crypto_pwhash_async(output, password, salt, opslimit, memlimit, algorithm, cb)
  , (cb) => {
      sodium.mlock(output)
      cb(null, output)
    }
  ], callback)
}

function verifyPass (hash, pass, callback) {
  const password = new Buffer(pass)
  sodium.crypto_pwhash_str_verify_async(hash, password, callback)
}

// Encrypt a message with crypto_secretbox -- uses one key, not pair
function encryptSingle (message, pass) {
  const nonce = sodium.malloc(sodium.crypto_secretbox_NONCEBYTES)
  const key = sodium.malloc(sodium.crypto_secretbox_KEYBYTES)
  message = new Buffer(message)
  const cipher = sodium.malloc(message.length + sodium.crypto_secretbox_MACBYTES)
  sodium.randombytes_buf(nonce)
  sodium.mlock(nonce)
  sodium.randombytes_buf(key)
  sodium.mlock(key)
  // encrypted message is stored in cipher.
  sodium.crypto_secretbox_easy(cipher, message, nonce, key)
}

// use libsodium to generate a keypair
function createKeyPair (privKey) {
  const pubKey = sodium.malloc(sodium.crypto_box_PUBLICKEYBYTES)
  sodium.crypto_box_keypair(pubKey, privKey)
  sodium.mlock(pubKey)
  return pubKey
}

// Encrypt a message from userA to userB
// pass in the buffer for userA's privKey to authenticate
// pass in the buffer for userB's pubKey to encrypt
function encrypt (message, publicKey, secretKey) {
  // encrypted message is stored in cipher.
  const cipher = sodium.malloc(message.length + sodium.crypto_box_MACBYTES)
  const nonce = sodium.malloc(sodium.crypto_box_NONCEBYTES)
  sodium.randombytes_buf(nonce)
  sodium.mlock(nonce)
  sodium.crypto_box_easy(cipher, message, nonce, publicKey, secretKey)
  sodium.mlock(cipher)
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
