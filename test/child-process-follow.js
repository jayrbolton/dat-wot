const {setup, handshake} = require('../')

const prefix = 'test/tmp'

const handlers = {
  // Parent process has initialized user and sends key to us to make a handshake
  startHandshake: (user, key) => {
    handshake(user, key, 'arstarst', (dat, user, otherUser) => {
      console.log('handshake from child process done')
      process.send({name: 'shook', data: null})
    })
  }
, completed: () => process.exit(1)
}

setup({path: prefix + '/follow-test/u2-base', name: 'finn', passphrase: 'arstarst', numBits: 512}, (user) => {
  process.send({name: 'startFollow', data: user.publicMetadat.key.toString('hex')})

  process.on('message', (msg) => {
    const {name, data} = msg
    handlers[name](user, data)
  })
})
