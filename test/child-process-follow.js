const {setup, handshake} = require('../')

const prefix = 'test/tmp'

var user

const handlers = {
  completed: () => {
    console.log('in: child process completed')
    user.publicMetadat.close()
    process.exit(1)
  }
, setup: () => {
    setup({path: prefix + '/follow-test/u2-base', name: 'finn', passphrase: 'arstarst', numBits: 512}, (u) => {
      user = u
      process.send({name: 'startFollow', data: user.publicMetadat.key.toString('hex')})
    })
  }
}

process.on('message', (msg) => {
  const {name, data} = msg
  handlers[name](data)
})

