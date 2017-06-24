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
    checkHandshake(user, key, (userA, userB) => {
      console.log('child checkHandshake finished')
      process.send({name: 'checkComplete', data: userA.relationships})
    })
  }
, completed: () => {
    user.publicMetadat.close()
    process.exit(1)
  }
, setup: () => {
    setup({path: 'test/tmp/handshake-test/u2-base', name: 'u2', passphrase: 'arstarst', numBits: 512}, (u) => {
      user = u
      console.log('child process finished setup')
      process.send({name: 'startHandshake', data: user.publicMetadat.key.toString('hex')})
    })
  }
}

process.on('message', (msg) => {
  const {name, data} = msg
  handlers[name](data)
})
