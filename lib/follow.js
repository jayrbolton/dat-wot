const fs = require('fs-extra')
const download = require('./download')
const waterfall = require('run-waterfall')
const parallel = require('run-parallel')

// Have one user follow the public dat for another user
module.exports = function follow (userA, key, cb) {
  // First, download the given user's public dat into a temp directory
  const tmpPath = userA.path + '/.tmp'
  const tasks = [
    (cb) => fs.ensureDir(tmpPath, cb),
    (dir, cb) => download(key, tmpPath, cb),
    (dat, cb) => parallel([
      (cb) => fs.readFile(tmpPath + '/id', 'utf-8', cb),
      (cb) => fs.readFile(tmpPath + '/pubkey', cb)
    ], cb),
    // construct the userB object
    (results, cb) => cb(null, {
      id: results[0],
      pubKey: results[1],
      path: userA.path + '/follows/' + results[0].toString('hex')
    }),
    (userB, cb) => fs.move(tmpPath, userB.path, {overwrite: true}, (err) => cb(err, userB))
  ]

  waterfall(tasks, cb)
}
