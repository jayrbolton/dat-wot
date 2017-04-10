const fs = require('fs')
const openpgp = require('openpgp')
const Dat = require('dat-node')
const createDir = require('./create-dir')

openpgp.initWorker({path: 'openpgp.worker.js'})
openpgp.config.aead_protect = true

// Setup a new user
function setup(options, cb) {
  const {path, name, passphrase} = options
  createDir(path)
  createDir(path + '/dats')
  const datDir = path + '/' + name
  cb = cb || function(){}

  // Create the pgp keys and save them to disk
  const pgpOptions = {userIds: [{name}], numBits: options.numBits || 4096, passphrase}
  createPgpKey(pgpOptions, (pgpKeys) => {
    writeKeys(path + '/.keys', name, pgpKeys)

    // Create the public metadat
    createPublicMetadat(datDir, (dat) => {
      const createdAt = new Date()

      // write public dats file to disk
      const pubListPath = path + '/' + name + '/' + 'pub.json'
      const pub = { dats: [] }

      // write user data to disk
      const userJsonPath = path + '/user.json'
      const baseDir = path
      const userJson = {
        name, createdAt, baseDir
      , relationships: [], follows: []
      , publicMetadatKey: dat.key.toString('hex')
      }
      
      fs.writeFileSync(pubListPath, JSON.stringify(pub))
      fs.writeFileSync(userJsonPath, JSON.stringify(userJson))

      const network = dat.joinNetwork({})
      // Return the brand new user
      cb({
        name, createdAt, baseDir
      , publicKeyArmored: pgpKeys.publicKeyArmored
      , publicMetadat: dat
      , privateDats: [], publicDats: [], relationships: [], follows: []
      })
    })
  })
}

function createPublicMetadat(dir, cb) {
  cb = cb || function(){}
  console.log('generating public metadat')
  createDir(dir)
  Dat(dir, (err, dat) => {
    if(err) throw err
    console.log('public metadat generated')
    cb(dat)
  })
}

function createPgpKey(opt, cb) {
  cb = cb || function(){}
  console.log('generating pgp keys')
  openpgp.generateKey(opt)
    .then(key => {
      console.log('pgp keys generated')
      cb(key)
    })
    .catch(error => console.log('error creating pgp keys', error))
}

function writeKeys(dir, username, keys) {
  console.log('writing pgp keys to file')
  createDir(dir)
  const privkey = keys.privateKeyArmored
  const pubkey = keys.publicKeyArmored
  fs.writeFile(dir + '/private.key', privkey, ()=>{})
  fs.writeFile(dir + '/public.key', pubkey, ()=>{})
}

module.exports = setup
