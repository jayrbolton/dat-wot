const fs = require('fs')
const Dat = require('dat-node')
const createDir = require('./create-dir')

// Have one user follow the public metadat for another user
function follow(userA, userB, cb) {
  const followDir = userA.baseDir + '/' + userB.name
  createDir(userA.baseDir + '/' + userB.name)
  Dat(followDir, {key: userB.publicMetadatKey}, (err, dat) => {
    dat.joinNetwork()
    cb(true)
  })
}

module.exports = follow
