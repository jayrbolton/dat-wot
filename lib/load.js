const fs = require('fs')
const Dat = require('dat-node')
const json = require('./utils/json')

// Load an existing metadat user
function load(path, passphrase, cb) {
  if(!fs.existsSync(path)) throw "Path does not exist"

  const publicKeyArmored = fs.readFileSync(path + '/.keys/public.key')
  const user = json.read(path + '/user.json')
  const pub = json.read(path + '/' + user.name + '/pub.json')

  console.log("loaded", user)
  Dat(path + '/' + user.name, { key: user.publicMetadatKey }, (err, dat) => {
    if(err) throw err
    cb({
      publicKeyArmored
    , publicMetadat: dat
    , publicDats: pub.dats
    , relationships: user.relationships
    , follows: user.follows
    , baseDir: user.baseDir
    , name: user.name
    , createdAt: user.createdAt
    , publicMetadatKey: user.publicMetadatKey
    })
  })
}

module.exports = load
