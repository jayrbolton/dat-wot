const {setup, handshake, checkHandshake} = require('../')

var userB, relDatFrom, relDat

process.on('message', ({name, data}) => handlers[name](data))

const handlers = {
  setup: () => {
    setup({path: 'test/tmp/createDat-test/userB-base', name: 'userB', pass: 'arstarst', numBits: 512}, (err, u) => {
      if (err) throw err
      userB = u
      process.send({name: 'handshake', data: userB.publicDat.key.toString('hex')})
    })
  },
  // check the handshake from userA and also initate a handshake with them
  handshake: (userAKey) => {
    checkHandshake(userB, userAKey, (err, userA, dat) => {
      if (err) throw err
      relDatFrom = dat
      handshake(userB, userAKey, (err, userA, dat) => {
        if (err) throw err
        relDat = dat
        process.send({name: 'checkHandshake', data: userB.publicDat.key.toString('hex')})
      })
    })
  },
  done: () => {
    relDat.close()
    relDatFrom.close()
    userB.publicDat.close()
    process.exit(1)
  }
}
