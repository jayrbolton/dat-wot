const fs = require('fs')
const openpgp = require('openpgp')
const Dat = require('dat-node')
const createDir = require('./utils/createDir')
const json = require('./utils/json')
const uuid = require('uuid')

openpgp.config.aead_protect = true

// Setup a new user
module.exports = function setup (options, cb) {
  cb = cb || function (){}
  const {path, name, passphrase} = options
  const id = uuid.v1()
  const dirs = {
    base: path
  , dats: path + '/dats'
  , follows: path + '/follows'
  , relationships: path + '/relationships'
  , pub: path + '/public-metadat'
  , handshakes: path + '/public-metadat/handshakes'
  }
  for(var key in dirs) {
    createDir(dirs[key])
  }

  // Create the pgp keys
  const pgpOptions = {userIds: [{name}], numBits: options.numBits || 4096, passphrase}
  createPgpKey(pgpOptions, (pgpKeys) => {
    const createdAt = new Date()
    const pubKey = pgpKeys.publicKeyArmored
    const privKey = pgpKeys.privateKeyArmored
    // write public data to the the user's public metadat
    const pubListPath = dirs.pub + '/user.json'
    const pub = { id, name, pubKey, dats: [] }
    json.write(pubListPath, pub)
    // write (private and local-only) user data to disk
    const userJsonPath = path + '/user.json'
    var userJson = { id, name, createdAt , publicDats: [], privateDats: [], relationships: {}, follows: {} , pubKey, privKey, dirs }

    // Create the public metadat
    Dat(dirs.pub, (err, dat) => {
      if(err) throw err
      const progress = dat.importFiles({watch: true})
      progress.on('put', function (src, dest) {
        console.log('Importing ', src.name, ' into archive')
      })
      userJson.publicMetadatKey = dat.key.toString('hex')
      json.write(userJsonPath, userJson)
      userJson.publicMetadat = dat
      userJson.passphrase = passphrase

      dat.joinNetwork({}, err => cb(userJson))
    })
  })
}

function createPgpKey (opt, cb) {
  cb = cb || function (){}
  openpgp.generateKey(opt).then(key => { cb(key) }).catch(error => console.error('error creating pgp keys', error))
}

