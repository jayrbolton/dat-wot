const fs = require('fs-extra')
const Dat = require('dat-node')
const json = require('./utils/json')

// Create a new dat with permissions
// accessIDs is an array of user IDs to share the dat with
module.exports = function createDat (user, datName, accessIDs, cb) {
  const dir = user.path + '/dats/' + datName
  if (fs.existsSync(dir)) throw new Error("A dat with that name has already been created")
  fs.ensureDirSync(dir)
  Dat(dir, (err, dat) => {
    if (err) throw err
    // loop through every userID in accessIDs and place this dat ID in their push-rel-dat
    accessIDs.forEach(id => {
      const relPushPath = user.path + '/relationships/' + id
      fs.exists(relPushPath, (exists) => {
        if (!exists) done++
        json.update(relPushPath + '/dats.json', {
          [datName]: dat.toString('hex')
        })
      })
    })
    cb(dat)
  })
}
