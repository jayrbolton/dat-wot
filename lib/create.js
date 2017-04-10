const fs = require('fs')
const Dat = require('dat-node')
const createDir = require('./create-dir')

// Create a new dat and set its download permissions
function create(user, options, cb) {
  const dir = user.baseDir + '/dats/' + options.name
  createDir(dir)
  Dat(dir, (err, dat) => {
    dat.joinNetwork()
    if(options.public) {
      console.log("!!!!", user.baseDir + '/' + user.name + '/pub.json')
      const pub = JSON.parse(fs.readFileSync(user.baseDir + '/' + user.name + '/pub.json'))
      pub.dats = pub.dats.concat([dat.key.toString('hex')])
      fs.writeFileSync(user.basedir + '/' + user.name + '/pub.json', JSON.stringify(pub))
    }
    cb(true)
  })
}

module.exports = create
