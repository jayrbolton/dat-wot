const json = require('../lib/utils/json')
const {setup, handshake, checkHandshake} = require('../')

var userB, relDatFrom, relDat

const handlers = {
  // Parent process has initialized userA and sends key to us to make a handshake
  startHandshake: (key) => {
    handshake(userB, key, 'arstarst', (dat, userB, otherUser) => {
      process.send({name: 'handshakeComplete', data: userB.id})
    })
  }
, checkAndStartHandshake: (key) => {
    checkHandshake(userB, key, (userB, userA, dat) => {
      relDatFrom = dat
      handshake(userB, key, (userB, userA, dat) => {
        relDat = dat
        process.send({name: 'checkHandshake', data: userB.publicDat.key.toString('hex')})
      })
    })
  }
, checkComplete: () => {
    userB.publicDat.close()
    relDatFrom.close()
    relDat.close()
    process.send({name: 'checkComplete', data: userB.id})
    process.exit(1)
  }
, setup: () => {
    setup({path: 'test/tmp/handshake-test/userB-base', name: 'userB', pass: 'arstarst', numBits: 512}, (u) => {
      userB = u
      process.send({name: 'startHandshake', data: userB.publicDat.key.toString('hex')})
    })
  }
}

process.on('message', (msg) => {
  console.log('child got', msg.name)
  const {name, data} = msg
  handlers[name](data)
})
