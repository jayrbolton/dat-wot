const fs = require('fs')
const Dat = require('dat-node')
const createDir = require('./utils/create-dir')
const json = require('./utils/json')

// Create a new dat and set its download permissions
function createDat(user, options, cb) {
  const dir = user.dirs.base + '/dats/' + options.name
  createDir(dir)
  Dat(dir, (err, dat) => {
    if(err) throw err
    if(options.public) {
      const pubPath = user.dirs.base + '/' + user.id + '/user.json'
      const pub = json.read(pubPath)
      pub.dats = pub.dats.concat([dat.key.toString('hex')])
      json.write(pubPath, pub)
    }
    cb(dat)
  })
}

module.exports = createDat
