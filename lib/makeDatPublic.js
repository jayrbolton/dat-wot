const json = require('./utils/json')

// Share an existing dat to all users
module.exports = function makeDatPublic (user, datName, callback) {
  const datInfo = user.dats[datName]
  const jsonPath = user.publicDat.path + '/dats.json'
  const pubData = {
    [datName]: {
      key: datInfo.key
    }
  }
  json.update(jsonPath, pubData, (err) => {
    if (err) return callback(err)
    user.publicDat.importFiles((err) => {
      user.dats[datName].public = true
      callback(err, user)
    })
  })
}
