const fs = require('fs-extra')
const Dat = require('dat-node')
const json = require('./utils/json')
const waterfall = require('run-waterfall')

// Create a new dat with permissions
// accessIDs is an array of user IDs to share the dat with
module.exports = function createDat (user, datName, callback) {
  const dir = user.path + '/dats/' + datName
  waterfall([
    (cb) => fs.ensureDir(dir, cb)
  , (dir, cb) => Dat(dir, cb)
  ], callback)
}
