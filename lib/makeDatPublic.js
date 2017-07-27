const fs = require('fs-extra')
const Dat = require('dat-node')
const json = require('./utils/json')
const waterfall = require('run-waterfall')

// Create a new dat and share it in the users public dats
module.exports = function makeDatPublic (user, dat, datName, cb) {
  const jsonPath = user.path + '/public/dats.json'
  json.update(jsonPath, {[datName]: dat.key.toString('hex')}, cb)
}
