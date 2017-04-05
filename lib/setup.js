const fs = require('fs')
const openpgp = require('openpgp')
const Dat = require('dat-node')

openpgp.initWorker({path: 'openpgp.worker.js'})
openpgp.config.aead_protect = true

// Setup a new user
function setup(options, cb) {
  const {path, name, passphrase} = options
  createDir(path)
  const datDir = path + '/' + name
  cb = cb || function(){}

  // Create the pgp keys and save them to disk
  const pgpOptions = {userIds: [{name}], numBits: 512 /* 4096 */, passphrase}
  createPgpKey(pgpOptions, (pgpKeys) => {
    writeKeys(path + '/.keys', name, pgpKeys)

    // Create the public metadat
    createPublicMetadat(datDir, datKey => {
      cb(pgpKeys, datKey)
    })
  })
}
 
function createPublicMetadat(dir, cb) {
  cb = cb || function(){}
  console.log('generating public metadat')
  createDir(dir)
  const dat = Dat({dir})
  dat.share(err => {
    if(err) throw err
    console.log('public metadat generated')
    cb(dat.key.toString('hex'))
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
  fs.writeFile(dir + '/' + username + '-private.key', privkey, ()=>{})
  fs.writeFile(dir + '/' + username + '-public.key', pubkey, ()=>{})
}

function createDir(dir) {
  if(!fs.existsSync(dir)) fs.mkdirSync(dir)
}

module.exports = setup
