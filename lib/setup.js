const fs = require('fs')
const flyd = require('flyd')
const flyd_zip = require('flyd-zip')
const R = require('ramda')
const openpgp = require('openpgp')
const Dat = require('dat-node')
const sqlite3 = require('sqlite3').verbose()

const dbInit = require('./schema.js')

openpgp.initWorker({path: 'openpgp.worker.js'})
openpgp.config.aead_protect = true

const createDir = (dir) => {
  if(!fs.existsSync(dir)) fs.mkdirSync(dir)
}

// Setup a new user
function setup(options) {
  const {path, name, email, passphrase} = options
  const username = name + '<' + email + '>'
  createDir(path)

  // Create the pgp keys and save them to disk
  const pgpOptions = {userIds: [{name, email}], numBits: 512 /* 4096 */, passphrase}
  const pgpKey$ = createPgpKeyStream(pgpOptions)
  flyd.map(writeKeys(path + '/.keys', username), pgpKey$)

  // Create the user's metadat
  const datDir = path + '/' + username
  const datKey$ = createDatKeyStream(datDir)
  const keys$ = flyd_zip([datKey$, pgpKey$])

  // Create the SQLite db and insert the user into the users table
  const db = dbInit(datDir + '.db')
  flyd.map(dbInsertUser(db, username, email, name), datKey$)

  // db.close()
  return {}
}
 
const dbInsertUser = (db, username, email, name) => datKey => {
  db.run(`INSERT INTO users VALUES (1,'${username}','${email}','${name}','${datKey}')`)
  console.log('inserted user')
}

const createDatKeyStream = dir => {
  console.log('generating dat')
  createDir(dir)
  const key$ = flyd.stream()
  const dat = Dat({dir})
  dat.share(err => {
    if(err) throw err
    console.log('dat generated')
    key$(dat.key.toString('hex'))
  })
  return key$
}

const createPgpKeyStream = opt => {
  console.log('generating pgp keys')
  const stream = flyd.stream()
  openpgp.generateKey(opt).then(key => {console.log({key}); stream(key)}).catch(error => console.log({error}))
  flyd.map(()=> console.log('pgp keys generated'), stream)
  return stream
}

const writeKeys = (dir, username) => key => {
  console.log('writing pgp keys to file')
  createDir(dir)
  const privkey = key.privateKeyArmored
  const pubkey = key.publicKeyArmored
  fs.writeFile(dir + '/' + username + '-private.key', privkey)
  fs.writeFile(dir + '/' + username + '-public.key', pubkey)
}

module.exports = setup
