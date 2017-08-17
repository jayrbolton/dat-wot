const json = require('./utils/json')
const download = require('./utils/download')
const waterfall = require('run-waterfall')

module.exports = function getPublicDats (userA, userB, callback) {
  if (!userA.follows[userB.id]) return callback(new Error('userA must follow userB to list public dats'))
  waterfall([
    (cb) => download(userB.publicDat.key, userB.publicDat.path, cb),
    (_, cb) => json.read(userB.publicDat.path + '/dats.json', cb)
  ], callback)
}
