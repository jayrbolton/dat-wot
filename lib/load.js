const crypto = require('../../wot-crypto') // TODO
const nodePath = require('path')
const hyperdb = require('hyperdb')
const parallel = require('run-parallel')

// Load an local, existing user
// All we need is the db instance and the path
module.exports = function load (path, pass, callback) {
  path = nodePath.resolve(path)
  const db = hyperdb(path + '/user.db', {valueEncoding: 'json'})
  parallel([
    (cb) => db.get('/ident', cb),
    (cb) => db.get('/name', cb),
    (cb) => db.get('/profileDatKey', cb)
  ], function (err, results) {
    if (err) return callback(err)
    const ident = results[0][0].value
    const name = results[1][0].value
    const profileDatKey = results[2][0].value
    // Unlock the stamp and key
    crypto.hashPass(pass, ident._salt, function (err, pwhash) {
      if (err) return callback(err)
      ident.stamp = crypto.decrypt(pwhash.secret, ident.stamp_locked)
      ident.key = crypto.decrypt(pwhash.secret, ident.key_locked)
      callback(null, {db, path, ident, name, profileDatKey})
    })
  })
}
