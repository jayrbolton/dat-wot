const importAll = require('./utils/importAll')
const json = require('./utils/json')

// Share an existing dat to all users
module.exports = function makeDatPublic (user, datName, callback) {
  const datInfo = user.dats[datName]
  const jsonPath = user.path + '/public/dats.json'
  const pubData = {
    [datName]: {
      key: datInfo.key
    }
  }
  json.update(jsonPath, pubData, (err) => {
    if (err) callback(err)
    datInfo.instance.joinNetwork()
    importAll(datInfo.instance, (err) => {
    //const importer = datInfo.instance.importFiles((err) => {
      user.dats[datName].public = true
      callback(err, user)
    })
  })
}
