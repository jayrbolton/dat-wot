const merge = require('ramda/src/merge')
const fs = require('fs')
const openpgp = require('openpgp')
const Dat = require('dat-node')
const createDir = require('./utils/create-dir')
const json = require('./utils/json')
const uuid = require('uuid')

openpgp.config.aead_protect = true

// Setup a new user
function setup(options, cb) {
  cb = cb || function(){}
  const {path, name, passphrase} = options
  const id = uuid.v1()
  const dirs = {
    base: path
  , dats: path + '/dats'
  , follows: path + '/follows'
  , relationships: path + '/relationships'
  , pub: path + '/' + id
  , handshakes: path + '/' + id + '/handshakes'
  }
  for(var key in dirs) { 
    createDir(dirs[key])
  }

  // Create the pgp keys
  const pgpOptions = {userIds: [{name}], numBits: options.numBits || 4096, passphrase}
  createPgpKey(pgpOptions, (pgpKeys) => {
    // Create the public metadat
    createPublicMetadat(dirs.pub, (dat) => {
      const createdAt = new Date()
      const pubKey = pgpKeys.publicKeyArmored
      const privKey = pgpKeys.privateKeyArmored

      // write public data to the the user's public metadat
      const pubListPath = dirs.pub + '/user.json'
      const pub = { id, pubKey, dats: [] }
      json.write(pubListPath, pub)

      // write (private and local-only) user data to disk
      const userJsonPath = path + '/user.json'
      const userJson = {
        id, name, createdAt
      , publicDats: [], privateDats: [], relationships: {}, follows: {}
      , pubKey, privKey
      , publicMetadatKey: dat.key.toString('hex')
      , dirs
      }
      json.write(userJsonPath, userJson)

      // Return the new user object -- add in the actual dat object, which can't be serialized to json
      cb(merge(userJson, { publicMetadat: dat }))
    })
  })
}

function createPublicMetadat(dir, cb) {
  cb = cb || function(){}
  createDir(dir)
  Dat(dir, (err, dat) => {
    if(err) throw err
    cb(dat)
  })
}

function createPgpKey(opt, cb) {
  cb = cb || function(){}
  openpgp.generateKey(opt).then(key => { cb(key) }).catch(error => console.error('error creating pgp keys', error))
}

module.exports = setup
