const fs = require('fs-extra')
const Dat = require('dat-node')
const json = require('./utils/json')
const waterfall = require('run-waterfall')

// Create a new dat and share it in the users public dats
module.exports = function createPublic (user, datName, cb) {
  const dir = user.path + '/dats/' + datName
  const jsonPath = user.path + '/public/dats.json'
  // waterfall:
  const tasks = [
    (cb) => fs.ensureDir(dir, cb)
  , (dir, cb) => Dat(dir, cb)
  , (dat, cb) => 
      json.update(
        jsonPath
      , {[datName]: dat.key.toString('hex')}
      , (err) => cb(err, dat)
      )
  ]
  waterfall(tasks, cb)
}
