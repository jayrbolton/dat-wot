const parallel = require('run-parallel')

// Shut down a local user, closing all their dats
module.exports = function close (user, callback) {
  if (!user.publicDat || !user.pushRelDats || !user.pullRelDats || !user.dats) {
    throw new TypeError('Pass in a local dat-pki user')
  }

  let closeDats = [
    (cb) => user.publicDat.close(cb)
  ]
  for (let name in user.pushRelDats) {
    closeDats.push((cb) => user.pushRelDats[name].close(cb))
  }
  for (let name in user.dats) {
    closeDats.push((cb) => user.dats[name].instance.close(cb))
  }
  parallel(closeDats, (err) => { callback(err, user) })
}
