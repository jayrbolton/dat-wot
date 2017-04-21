const omit = require('ramda/src/omit')
const fs = require('fs')
const Dat = require('dat-node')
const createDir = require('./utils/create-dir')
const json = require('./utils/json')
const download = require('./download')

// Have one user follow the public metadat for another user
function follow(userA, key, cb) {
  // First, download the given user's public metadat into a temp directory
  const tmpPath = userA.dirs.base + '/.tmp'
  createDir(tmpPath)
  download(key, tmpPath, dat => {
    dat.close()
    const userB = json.read(tmpPath + '/user.json')
    const followPath = userA.dirs.follows + '/' + userB.id
    fs.renameSync(tmpPath, followPath)
    const jsonPath = userA.dirs.base + '/user.json'
    userA.follows[userB.id] = followPath
    json.write(jsonPath, omit(['publicMetadat'], userA))
    cb(userA, userB)
  })
}

module.exports = follow
