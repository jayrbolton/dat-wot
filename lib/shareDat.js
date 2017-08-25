const json = require('./utils/json')
const parallel = require('run-parallel')
const waterfall = require('run-waterfall')

// Share a dat with certain contacts
module.exports = function shareDat (user, datName, accessIDs, callback) {
  if (!user.dats[datName]) throw new Error('User "' + user.name + '" does not have a dat with name "' + datName + '"')
  const dat = user.dats[datName].instance
  const relPath = id => user.path + '/relationships/' + id
  const datId = dat.key.toString('hex')
  // write an entry in the dats.json file for each userID with a key of datName and a value of the dat ID
  const writes = accessIDs.map(id => cb => {
    // user.pushRelDats[id] = dat
    const relDat = user.pushRelDats[id]
    waterfall([
      cb => json.update(relPath(id) + '/dats.json', {[datName]: datId}, cb),
      cb => relDat.importFiles(err => cb(err, dat))
    ], cb)
  })
  parallel(writes, callback)
}
