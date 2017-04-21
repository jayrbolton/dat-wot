const json = require('../lib/utils/json')
const {setup, handshake, checkHandshake} = require('../')

const handlers = {
  // Parent process has initialized user and sends key to us to make a handshake
  startHandshake: (user, key) => {
    handshake(user, key, 'arstarst', (dat, user, otherUser) => {
      process.send({name: 'handshakeComplete', data: user.id})
    })
  }
, checkHandshake: (user, otherUserID) => {
    const otherUser = json.read(user.dirs.follows + '/' + otherUserID + '/user.json')
    checkHandshake(user, otherUser)
  }
, completed: () => process.exit(1)
}

setup({path: 'test/tmp/handshake-test/u2-base', name: 'u2', passphrase: 'arstarst', numBits: 512}, (user) => {
  process.send({name: 'startHandshake', data: user.publicMetadat.key.toString('hex')})

  process.on('message', (msg) => {
    const {name, data} = msg
    handlers[name](user, data)
  })
})
