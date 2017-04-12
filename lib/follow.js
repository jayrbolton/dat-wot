const fs = require('fs')
const Dat = require('dat-node')
const createDir = require('./utils/create-dir')
const json = require('./utils/json')

// Have one user follow the public metadat for another user
function follow(userA, userB, cb) {
  const followDir = userA.baseDir + '/follows/' + userB.name
  createDir(followDir)
  Dat(followDir, {key: userB.publicMetadatKey}, (err, dat) => {
    dat.joinNetwork()
    // Once the dat is successfully joined, now add their pub metadat key to userA's pub.json
    const pubPath = userA.baseDir + '/' + userA.name + '/pub.json'
    const pubs = json.read(pubPath)
    pubs.dats = pubs.dats.concat([dat.key.toString('hex')])
    json.write(pubPath, pubs)
    cb(dat)
  })
}

module.exports = follow
