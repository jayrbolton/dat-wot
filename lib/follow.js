const fs = require('fs-extra')
const Dat = require('dat-node')
const json = require('./utils/json')
const download = require('./download')

// Have one user follow the public dat for another user
module.exports = function follow (userA, key, cb) {
  // First, download the given user's public dat into a temp directory
  const tmpPath = userA.path + '/.tmp'
  fs.ensureDirSync(tmpPath)
  download(key, tmpPath, (dat) => {
    // TODO: refactor this out with /load.js
    const id = fs.readFileSync(tmpPath + '/id', 'utf-8')
    const userB = {
      id
    , pubKey: fs.readFileSync(tmpPath + '/pubkey')
    , path: userA.path + '/follows/' + id.toString('hex')
    }
    // TODO: think more about handling the re-follow case
    fs.moveSync(tmpPath, userB.path, {overwrite: true})
    cb(userA, userB)
  })
}
