const {setup, handshake, checkHandshake, close} = require('../')

const path = './test/tmp/handshake'
let userB
process.on('message', ({name, data}) => handlers[name](data))
process.on('message', ({name, data}) => console.log('child  process received', name))

const handlers = {
  setup: () => {
    setup({path: path + '/userB', name: 'userB', pass: 'arstarst'}, (err, u) => {
      if (err) throw err
      userB = u
      process.send({name: 'startHandshake', data: userB.publicDat.key.toString('hex')})
    })
  },
  checkAndStartHandshake: (key) => {
    checkHandshake(userB, key, (err, uB, userA, dat) => {
      userB = uB
      if (err) throw err
      handshake(userB, key, (err, uB, userA, dat) => {
        userB = uB
        if (err) throw err
        process.send({name: 'checkHandshake', data: userB.publicDat.key.toString('hex')})
      })
    })
  },
  checkComplete: () => {
    close(userB, err => { if (err) throw err })
    process.send({name: 'checkComplete', data: userB.id})
    process.exit(1)
  }
}
