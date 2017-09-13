const fs = require('fs-extra')
const download = require('../../dat-download')
const waterfall = require('run-waterfall')
const parallel = require('run-parallel')

// Have one user follow the public dat for another user
// Pass in the public dat key for the other user
module.exports = function follow (userA, key, callback) {
  if (Buffer.isBuffer(key)) key = key.toString('hex')
  // First, download the given user's public dat into a temp directory
  const tmpPath = userA.path + '/tmp'
  waterfall([
    (cb) => fs.ensureDir(tmpPath, cb),
    (dir, cb) => download(key, tmpPath, cb),
    (x, cb) => {
      parallel([
        (cb) => fs.readFile(tmpPath + '/id', 'utf-8', cb),
        (cb) => fs.readFile(tmpPath + '/pubkey', cb)
      ], (err, files) =>
        cb(err, { // userB object from above files
          id: files[0],
          pubkey: files[1],
          publicDatKey: key,
          path: userA.path + '/follows/' + files[0]
        })
      )
    },
    (userB, cb) => {
      userA.follows[userB.id] = true
      fs.move(tmpPath, userB.path, {overwrite: true}, (err) => {
        cb(err, userB)
      })
    }
  ], callback)
}
