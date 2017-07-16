const fs = require('fs-extra')
const Dat = require('dat-node')
const json = require('./utils/json')

// Create a new dat and set its download permissions
module.exports = function createDat (user, options, cb) {
  const dir = user.path + '/dats/' + options.name
  if (!options.name) throw new TypeError("Please pass in a name for the new dat")
  if (fs.existsSync(dir)) throw new Error("A dat with that name has already been created")
  fs.ensureDirSync(dir)
  Dat(dir, (err, dat) => {
    if (err) throw err
    if (options.public) {
      const path = user.path + '/public/dats.json'
      const publicDats = json.read(path)
      publicDats[options.name] = dat.key.toString('hex')
      json.write(path, publicDats)
    }
    cb(dat)
  })
}
