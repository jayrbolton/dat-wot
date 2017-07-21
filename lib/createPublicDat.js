const fs = require('fs-extra')
const Dat = require('dat-node')
const json = require('./utils/json')

// Create a new dat and share it in the users public dats
module.exports = function createPublic (user, datName, cb) {
  const dir = user.path + '/dats/' + datName
  if (fs.existsSync(dir)) throw new Error("A dat with that name has already been created")
  fs.ensureDirSync(dir)
  Dat(dir, (err, dat) => {
    if (err) throw err
    const path = user.path + '/public/dats.json'
    const publicDats = json.read(path)
    publicDats[datName] = dat.key.toString('hex')
    json.write(path, publicDats)
    cb(dat)
  })
}
