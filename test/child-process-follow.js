const {setup, handshake} = require('../')
const prefix = 'test/tmp'
let userB

process.on('message', ({name, data}) => handlers[name](data))

const handlers = {
  completed: () => {
    console.log('in: child process completed')
    userB.publicDat.close()
    process.exit(1)
  }
, setup: () => {
    setup({path: prefix + '/follow-test/userB-base', name: 'finn', pass: 'arstarst'}, (err, u) => {
      if (err) throw err
      userB = u
      process.send({name: 'startFollow', data: userB.publicDat.key.toString('hex')})
    })
  }
}

