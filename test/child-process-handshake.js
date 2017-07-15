const json = require('../lib/utils/json')
const {setup, handshake, checkHandshake} = require('../')

var user

const handlers = {
  // Parent process has initialized user and sends key to us to make a handshake
  startHandshake: (key) => {
    handshake(user, key, 'arstarst', (dat, user, otherUser) => {
      process.send({name: 'handshakeComplete', data: user.id})
    })
  }
, checkHandshake: (key) => {
    checkHandshake(user, key, (userA, userB, relDat) => {
      console.log('child checkHandshake finished')
      process.send({name: 'checkComplete', data: {userB, relDat}})
    })
  }
, completed: () => {
    user.publicDat.close()
    process.exit(1)
  }
, setup: () => {
    setup({path: 'test/tmp/handshake-test/userB-base', name: 'userB', passphrase: 'arstarst', numBits: 512}, (u) => {
      user = u
      console.log('child process finished setup')
      process.send({name: 'startHandshake', data: user.publicDat.key.toString('hex')})
    })
  }
}

process.on('message', (msg) => {
  console.log('child got', msg.name)
  const {name, data} = msg
  handlers[name](data)
})
