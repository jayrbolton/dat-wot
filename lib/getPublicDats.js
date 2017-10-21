const json = require('./utils/json')
const download = require('./utils/download')
const waterfall = require('run-waterfall')

module.exports = function getPublicDats (userA, userB, callback) {
  if (!userA.follows[userB.id]) {
    return callback(new Error('userA must follow userB to list public dats'))
  }
  waterfall([
    (cb) => {
      download(userB.publicDatKey, userB.path, cb)
    },
    (x, cb) => {
      console.log('getpubdats', x)
      json.read(userB.path + '/dats.json', cb)
    }
  ], callback)
}
