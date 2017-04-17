const omit = require('ramda/src/omit')
const fs = require('fs')
const Dat = require('dat-node')
const createDir = require('./utils/create-dir')
const json = require('./utils/json')

// Have one user follow the public metadat for another user
function follow(userA, key, cb) {
  // First, download the given user's public metadat into a temp directory
  const tmpPath = userA.dirs.base + '/.tmp'
  createDir(tmpPath)
  console.log('key', key)
  Dat(tmpPath, {key}, (err, dat) => {
    if(err) throw err
    const network = dat.joinNetwork((err) => {
      if(err) throw err
      // Now read their public user data
      // XXX this doesn't seem to work. I need a way to wait on the dat to finish downloading
      if(err) throw err
      dat.close()
      const userB = json.read(tmpPath + '/user.json')
      console.log('follow id', userB.id)
      const followPath = userA.dirs.follows + '/' + userB.id
      fs.renameSync(tmpPath, followPath)
      const jsonPath = userA.dirs.base + '/user.json'
      userA.follows[userB.id] = followPath
      json.write(jsonPath, omit(['publicMetadat'], userA))
      Dat(followPath, {key: key}, (err, dat) => {
        if(err) throw err
        dat.joinNetwork(err => {
          if(err) throw err
          cb(dat, userA, userB)
        })
      })
    })
  })
}

module.exports = follow
