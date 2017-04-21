const createDir = require('./utils/createDir')
const path = require('path')
const mirror = require('mirror-folder')
const fs = require('fs')
const Dat = require('dat-node')
const ram = require('random-access-memory')

// Download an archive, calling cb when it is completed

module.exports = function download (key, dest, cb) {
  createDir(dest)
  Dat(ram, {key, sparse: true}, function (err, dat) {
    if (err) throw err
    const dload = () => {
      const progress = mirror({fs: dat.archive, name: '/'}, dest, (err) => {
        if (err) throw err
        console.log("-> Done")
        dat.close()
        cb(dat)
      })
      progress.on('put', (src) => console.log("-> Downloading", src.name))
    }
    const network = dat.joinNetwork()
    dat.archive.metadata.update(dload)
  })
}


