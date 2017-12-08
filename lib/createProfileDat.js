const fs = require('fs-extra')
const parallel = require('run-parallel')
const Dat = require('dat-node')

// to write:
// imprint
// lock
// cert

module.exports = function createProfileDat (path, ident, callback) {
  path = path + '/profile'
  Dat(path, function (err, dat) {
    if (err) return callback(err)
    parallel([
      (cb) => fs.writeFile(path + '/imprint', ident.imprint, cb),
      (cb) => fs.writeFile(path + '/lock', ident.lock, cb),
      (cb) => fs.writeFile(path + '/cert', ident.cert, cb)
    ], (err) => {
      if (err) return callback(err)
      callback(null, dat)
    })
  })
}
