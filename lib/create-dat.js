const fs = require('fs')
const Dat = require('dat-node')
const createDir = require('./utils/create-dir')
const json = require('./utils/json')

// Create a new dat and set its download permissions
function createDat(user, options, cb) {
  const dir = user.baseDir + '/dats/' + options.name
  createDir(dir)
  Dat(dir, (err, dat) => {
    dat.joinNetwork()
    if(options.public) {
      const pubPath = user.baseDir + '/' + user.name + '/pub.json'
      const pub = json.read(pubPath)
      pub.dats = pub.dats.concat([dat.key.toString('hex')])
      json.write(pubPath, pub)
    }
    cb(dat)
  })
}

module.exports = createDat
