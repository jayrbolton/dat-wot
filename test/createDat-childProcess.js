const json = require('../lib/utils/json')
const {setup, handshake, checkHandshake, createDat} = require('../')

var userB, relDatFrom, relDat

const handlers = {
  setup: () => {
    setup({path: 'test/tmp/createDat-test/userB-base', name: 'userB', pass: 'arstarst', numBits: 512}, (err, u) => {
      console.log("!!!!!!!!", err, u)
      userB = u
      process.send({name: 'handshake', data: userB.publicDat.key.toString('hex')})
    })
  }
  // check the handshake from userA and also initate a handshake with them
, handshake: (userAKey) => {
    checkHandshake(userB, userAKey, (userB, userA, dat) => {
      relDatFrom = dat
      handshake(userB, userAKey, (userB, userA, dat) => {
        relDat = dat
        process.send({name: 'checkHandshake', data: userB.publicDat.key.toString('hex')})
      })
    })
  }
, done: () => {
    relDat.close()
    relDatFrom.close()
    userB.publicDat.close()
    process.exit(1)
  }
}

process.on('message', (msg) => {
  console.log('child got', msg.name)
  const {name, data} = msg
  handlers[name](data)
})
