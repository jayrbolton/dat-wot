const fs = require('fs-extra')
const Dat = require('dat-node')
const waterfall = require('run-waterfall')

// Download and close an archive
module.exports = function download (key, dest, callback) {
  waterfall([
    (cb) => fs.ensureDir(dest, cb),
    (dir, cb) => Dat(dest, {key}, cb),
    (dat, cb) => {
      dat.joinNetwork()
      dat.archive.metadata.update(() => cb(null, dat))
    },
    (dat, cb) => {
      dat.archive.on('sync', (err) => {
        dat.close()
        cb(err, dat)
      })
    }
  ], callback)
}
