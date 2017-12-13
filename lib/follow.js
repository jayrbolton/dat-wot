const Dat = require('dat-node')
const ram = require('random-access-memory')

// Have one user follow the public dat for another user
// Pass in the profile dat key for the other user
module.exports = function follow (user, profileDatKey, callback) {
  // First, download the given user's public dat into a temp directory
  Dat(ram, {key: profileDatKey}, function (err, dat) {
    if (err) return callback(err)
    dat.joinNetwork()
    dat.archive.metadata.update(function () {
        /*
      dat.archive.content.on('data', function (err, chunk) {
        if (err) return callback(err)
        console.log('chunk', chunk)
      })
        */
      dat.archive.on('sync', (err) => {
        if (err) return callback(err)
      })
    })
  })
}
