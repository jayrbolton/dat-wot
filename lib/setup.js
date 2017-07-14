const fs = require('fs')
const Dat = require('dat-node')
const createDir = require('./utils/createDir')
const crypto = require('./utils/crypto')
const json = require('./utils/json')

// Setup a new user
module.exports = function setup ({path, name, pass}, cb) {
  cb = cb || function (){}
  var user = {
    createdAt: new Date()
  , name, pass, path
  }

  // Create some basic user directories
  const dirs = {
    base: path
  , dats: path + '/dats'
  , follows: path + '/follows'
  , relationships: path + '/relationships'
  , pub: path + '/public'
  , handshakes: path + '/public/handshakes'
  }
  user.dirs = dirs
  for(var key in dirs) {
    createDir(dirs[key])
  }

  // generate and write a user ID to their public dir
  user.id = crypto.uuid().toString('hex')
  fs.writeFileSync(path + '/public/id', user.id.toString('hex'))

  // generate the private and public keys
  const [pubKey, privKey] = crypto.createKeyPair()
  user.pubKey = pubKey
  user.privKey = privKey
  fs.writeFileSync(path + '/public/pubkey', pubKey.toString('hex'))
  fs.writeFileSync(path + '/privkey', privKey.toString('hex'))

  // write some public data to a json file in their public dat
  const pubListPath = dirs.pub + '/user.json'
  const publicData = { name }
  json.write(pubListPath, publicData)

  // Create the dat archive for their public dir
  Dat(dirs.pub, (err, dat) => {
    if (err) throw err
    const progress = dat.importFiles({watch: true, count: true})
    var totalBytes = 0
    var progressBytes = 0
    progress.once('count', function (data) {
      totalBytes = data.bytes
    })
    progress.on('put-data', function (chunk, src, dst) {
      progressBytes += chunk.length
      if (progressBytes === totalBytes) cb(user)
    })

    // write (private and local-only) user data to disk
    const localData = { createdAt: user.createdAt, publicMetadatKey: dat.key.toString('hex') }
    console.log('created', localData)
    json.write(path + '/user.json', localData)

    user.publicMetadat = dat
    var swarm = dat.joinNetwork(function () {
      console.log('setup: join network called back')
    })
  })
}
