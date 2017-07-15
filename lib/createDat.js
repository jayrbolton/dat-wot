const fs = require('fs-extra')
const Dat = require('dat-node')
const json = require('./utils/json')

// Create a new dat and set its download permissions
module.exports = function createDat (user, options, cb) {
  const dir = user.dirs.base + '/dats/' + options.name
  if (fs.existsSync(dir)) throw new Error("A dat with that name has already been created")
  fs.ensureDirSync(dir)
  Dat(dir, (err, dat) => {
    if (err) throw err
    console.log('dat created')
    if (options.public) {
      const pubPath = user.dirs.pub + '/user.json'
      const pub = json.read(pubPath)
      if (!pub.dats) pub.dats = []
      pub.dats = pub.dats.concat([dat.key.toString('hex')])
      json.write(pubPath, pub)
    }
    cb(dat)
  })
}
