const fs = require('fs-extra')
const Dat = require('dat-node')
const json = require('./utils/json')
const parallel = require('run-parallel')

// Share a dat with certain contacts and groups
module.exports = function shareDat (user, dat, datName, accessIDs, cb) {
  const relPath = id => user.path + '/relationships/' + id
  const datId = dat.key.toString('hex')
  // write an entry in the dats.json file for each userID with a key of datName and a value of the dat ID
  const writes = accessIDs.map(id => (cb) => {
    const data = {[datName]: datId}
    json.update(relPath(id) + '/dats.json', data, (err) => cb(err, dat))
  })
  parallel(writes, (err, results) => cb(err))
}
