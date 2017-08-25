const fs = require('fs-extra')
const Dat = require('dat-node')
const waterfall = require('run-waterfall')

// Create a new empty & private dat
module.exports = function createDat (user, datName, callback) {
  const dir = user.path + '/dats/' + datName
  waterfall([
    (cb) => fs.ensureDir(dir, cb),
    (dir, cb) => Dat(dir, cb),
    (dat, cb) => {
      dat.joinNetwork()
      user.dats[datName] = {
        instance: dat,
        public: false
      }
      console.log('1')
      dat.importFiles(err => cb(err, dat))
    }
  ], callback)
}
