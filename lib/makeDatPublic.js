const json = require('./utils/json')

// Share an existing dat to all users
module.exports = function makeDatPublic (user, datName, callback) {
  const datInfo = user.dats[datName]
  const jsonPath = user.path + '/public/dats.json'
  json.update(jsonPath, {[datName]: {key: datInfo.key}}, (err) => {
    user.dats[datName].public = true
    callback(err, user)
  })
}
