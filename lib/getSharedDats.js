const json = require('./utils/json')
const download = require('./utils/download')
const waterfall = require('run-waterfall')
const parallel = require('run-parallel')

// Get the dats shared to you by your contacts
module.exports = function getSharedDats (user, contactIDs, callback) {
  // construct an object of {contactID: [datIDs]}
  const relPath = id => user.path + '/relationships/from/' + id
  const datPath = id => relPath(id) + '/dats.json'
  const tasks = contactIDs.map(id => cb => {
    const pubDatKey = user.pullRelDats[id].key
    waterfall([
      cb => download(pubDatKey, relPath(id), cb),
      (_, cb) => json.read(datPath(id), cb),
      (dats, cb) => cb(null, [id, dats])
    ], cb)
  })
  parallel(tasks, (err, results) => {
    const merged = results.reduce((acc, [id, dats]) => { acc[id] = dats; return acc }, {})
    callback(err, merged)
  })
}
