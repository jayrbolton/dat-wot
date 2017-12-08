const fs = require('fs-extra')
const createProfileDat = require('./createProfileDat')
const ident = require('../../wot-identity') // TODO
const hyperdb = require('hyperdb')
const nodePath = require('path')

// Set up a new local user
module.exports = function setup ({path, pass, name}, callback) {
  path = nodePath.resolve(path)
  fs.ensureDir(path, function (err) {
    if (err) return callback(err)
    ident.createUser(pass, {name}, function (err, ident) {
      if (err) return callback(err)
      const db = hyperdb(path + '/user.db', {valueEncoding: 'json'})
      createProfileDat(path, ident, function (err, dat) {
        if (err) return callback(err)
        const profileDatKey = dat.key.toString('hex')
        const identToPut = {
          imprint: ident.imprint,
          lock: ident.lock,
          stamp_locked: ident.stamp_locked,
          key_locked: ident.key_locked,
          cert: ident.cert,
          _salt: ident._salt
        }
        db.batch([
          {type: 'put', key: '/ident', value: identToPut},
          {type: 'put', key: '/name', value: name},
          {type: 'put', key: '/profileDatKey', value: profileDatKey}
        ], function (err) {
          if (err) return callback(err)
          callback(null, {db, ident, path, name, profileDatKey})
        })
      })
    })
  })
}
