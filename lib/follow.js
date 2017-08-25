const fs = require('fs-extra')
const download = require('./utils/download')
const waterfall = require('run-waterfall')
const parallel = require('run-parallel')

// Have one user follow the public dat for another user
// Pass in the public dat key for the other user
module.exports = function follow (userA, key, callback) {
  // First, download the given user's public dat into a temp directory
  const tmpPath = userA.path + '/.tmp'
  let publicDat
  waterfall([
    (cb) => fs.ensureDir(tmpPath, cb),
    (dir, cb) => download(key, tmpPath, cb),
    (dat, cb) => {
      publicDat = dat
      parallel([
        (cb) => fs.readFile(tmpPath + '/id', 'utf-8', cb),
        (cb) => fs.readFile(tmpPath + '/pubkey', cb)
      ], cb)
    },
    // construct the userB object
    (results, cb) => cb(null, {
      id: results[0],
      pubKey: results[1],
      publicDat
    }),
    (userB, cb) => {
      userA.follows[userB.id] = true
      fs.move(tmpPath, userA.path + '/follows/' + userB.id, {overwrite: true}, (err) => {
        cb(err, userB)
      })
    }
  ], callback)
}
