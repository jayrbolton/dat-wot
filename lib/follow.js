const omit = require('ramda/src/omit')
const fs = require('fs-extra')
const Dat = require('dat-node')
const createDir = require('./utils/createDir')
const json = require('./utils/json')
const download = require('./download')

// Have one user follow the public metadat for another user
module.exports = function follow (userA, key, cb) {
  // First, download the given user's public metadat into a temp directory
  const tmpPath = userA.dirs.base + '/.tmp'
  createDir(tmpPath)
  console.log('follow: downloading')
  download(key, tmpPath, (dat) => {
    console.log('follow: download complete')
    // TODO: refactor this out with /load.js
    const userB = json.read(tmpPath + '/user.json')
    userB.pubKey = new Buffer(fs.readFileSync(tmpPath + '/pubkey'), 'hex')
    userB.id = fs.readFileSync(tmpPath + '/id')
    const followPath = userA.dirs.follows + '/' + userB.name + '-' + userB.id
    // TODO: think more about handling the re-follow case
    fs.moveSync(tmpPath, followPath, {overwrite: true})
    const jsonPath = userA.dirs.base + '/user.json'
    if (!userA.follows) userA.follows = {}
    userA.follows[userB.id] = followPath
    json.write(jsonPath, omit(['publicMetadat'], userA))
    cb(userA, userB)
  })
}
