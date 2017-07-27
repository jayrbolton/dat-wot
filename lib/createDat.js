const fs = require('fs-extra')
const Dat = require('dat-node')
const json = require('./utils/json')
const waterfall = require('run-waterfall')

// Create a new dat with permissions
// accessIDs is an array of user IDs to share the dat with
module.exports = function createPrivateDat (user, datName, accessIDs, callback) {
  const dir = user.path + '/dats/' + datName
  const relPath = id => user.path + '/relationships/' + id
  const writes = accessIDs.map(id => (dat, cb) => {
    // write an entry in the dats.json file for each userID with a key of datName and a value of the dat ID
    const data = {[datName]: dat.key.toString('hex')}
    json.update(relPath(id), data, (err) => cb(err, dat))
  })
  const tasks = [
    (cb) => fs.ensureDir(dir, cb)
  , (dir, cb) => Dat(dir, cb)
  ].concat(writes)
    
  waterfall(tasks, callback)
}
