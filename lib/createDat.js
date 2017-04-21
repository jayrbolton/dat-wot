const fs = require('fs')
const Dat = require('dat-node')
const createDir = require('./utils/createDir')
const json = require('./utils/json')

// Create a new dat and set its download permissions
module.exports = function createDat (user, options, cb) {
  const dir = user.dirs.base + '/dats/' + options.name
  if (fs.existsSync(dir)) throw new Error("A dat with that name has already been created")
  createDir(dir)
  Dat(dir, (err, dat) => {
    if(err) throw err
    if(options.public) {
      const pubPath = user.dirs.pub + '/user.json'
      const pub = json.read(pubPath)
      pub.dats = pub.dats.concat([dat.key.toString('hex')])
      json.write(pubPath, pub)
    }
    cb(dat)
  })
}

