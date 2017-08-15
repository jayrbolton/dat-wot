const fs = require('fs-extra')
const Dat = require('dat-node')
const waterfall = require('run-waterfall')

// Create a new empty & private dat
module.exports = function createDat (user, datName, callback) {
  const dir = user.path + '/dats/' + datName
  waterfall([
    (cb) => fs.ensureDir(dir, cb),
    (dir, cb) => Dat(dir, cb)
  ], (err, dat) => {
    dat.joinNetwork()
    user.dats[datName] = {
      key: dat.key.toString('hex'),
      instance: dat,
      public: false
    }
    callback(err, user, dat)
  })
}
