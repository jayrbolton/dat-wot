const swarm = require('discovery-swarm')
// Send a request to another user that you want to become contacts with them

// TODO
// - send encrypted push rel dat (or equivalent with hyperdb)
module.exports = function sendContactRequest (user, profileDatKey, callback) {
  const sw = swarm()
  user.db.get('name', function (err, nodes) {
    if (err) return callback(err)
    sw.listen()
    sw.join(profileDatKey)
    sw.on('connection', function (con) {
      con.write(`{"name": "${user.name}", "key": "${user.profileDatKey}"}`)
    })
  })
}
