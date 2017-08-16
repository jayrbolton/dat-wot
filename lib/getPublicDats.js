const json = require('./utils/json')
const download = require('./download')
const waterfall = require('run-waterfall')

module.exports = function getPublicDats (userA, userB, callback) {
  waterfall([
    (cb) => download(userB.publicDat.key, userB.path, cb),
    (_, cb) => json.read(userB.path + '/dats.json', cb)
  ], callback)
}
