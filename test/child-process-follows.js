const {setup, handshake} = require('../')

const prefix = '/tmp/metadat-test'

const handlers = {
  // Parent process has initialized user and sends key to us to make a handshake
  startHandshake: (user, key) => {
    handshake(user, key, 'arstarst', (dat, user, otherUser) => {
      console.log('handshake from child process done')
      process.send({name: 'shook', data: null})
    })
  }
}

setup({path: prefix + '/follow-test/u2-base', name: 'finn', passphrase: 'arstarst', numBits: 512}, (user) => {
  user.publicMetadat.importFiles()
  user.publicMetadat.joinNetwork(err => {
    if(err) throw err
    process.send({name: 'startFollow', data: user.publicMetadat.key.toString('hex')})
  })

  process.on('message', (msg) => {
    const {name, data} = msg
    handlers[name](user, data)
  })
})
