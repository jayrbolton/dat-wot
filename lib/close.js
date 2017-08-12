const parallel = require('run-parallel')

// Shut down a local user, closing all their dats
module.exports = function close (user, callback) {
  if (!user.publicDat || !user.pushRelDats || !user.pullRelDats || !user.dats) {
    throw new TypeError('Pass in a local dat-pki user')
  }

  let closeDats = []
  for (let name in user.pushRelDats) {
    closeDats.push((cb) => user.pushRelDats[name].close(cb))
  }
  for (let name in user.pullRelDats) {
    closeDats.push((cb) => user.pullRelDats[name].close(cb))
  }
  for (let name in user.dats) {
    closeDats.push((cb) => user.dats[name].instance.close(cb))
  }
  parallel([
    (cb) => user.publicDat.close(cb)
  ].concat(closeDats), (err) => {
    callback(err, user)
  })
}
