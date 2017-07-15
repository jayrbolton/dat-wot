const {setup, handshake} = require('../')

const prefix = 'test/tmp'

var userB

const handlers = {
  completed: () => {
    console.log('in: child process completed')
    userB.publicDat.close()
    process.exit(1)
  }
, setup: () => {
    setup({path: prefix + '/follow-test/userB-base', name: 'finn', passphrase: 'arstarst'}, (u) => {
      userB = u
      process.send({name: 'startFollow', data: userB.publicDat.key.toString('hex')})
    })
  }
}

process.on('message', (msg) => {
  const {name, data} = msg
  console.log('child received', name)
  handlers[name](data)
})

