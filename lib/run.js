const EventEmitter = require('events')
const Dat = require('dat-node')
const swarm = require('discovery-swarm')
// Share the profile dat, listen to the discovery swarm

// Create a Dat that serves as the user profile
module.exports = function run (user, callback) {
  const emitter = new EventEmitter()
  Dat(user.path + '/profile', function (err, profileDat) {
    if (err) return callback(err)
    profileDat.importFiles()
    profileDat.joinNetwork()
    const profileKey = profileDat.key.toString('hex')
    const sw = swarm({ maxConnections: 2 }) // TODO tweak maxConnections
    sw.listen()
    sw.join(profileKey)
    sw.on('connection', function (con) {
      con.on('data', (chunk) => {
        var json = chunk.toString('utf8')
        try {
          json = JSON.parse(json)
        } catch (e) {
          return emitter.emit('received:err', e)
        }
        console.log('name', json.name)
        console.log('key', json.key)
        user.db.get('/contactRequests', function (err, nodes) {
          if (err) return emitter.emit('received:err', err)
          const reqs = nodes ? JSON.parse(nodes[0].value) : {}
          if (reqs[json.key]) return
          reqs[json.key] = json.name
          user.db.put('/contactRequests', reqs, function (err) {
            if (err) return emitter.emit('received:err', err)
            console.log('DONE!!!')
          })
        })
      })
    })
    callback(null, profileDat)
  })
  return emitter
}
