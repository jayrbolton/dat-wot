const {getSharedDats, close, setup, handshake, checkHandshake} = require('../')

let userB

process.on('message', ({name, data}) => handlers[name](data))

const handlers = {
  setup: () => {
    setup({path: 'test/tmp/createDat-test/userB-base', name: 'userB', pass: 'arstarst'}, (err, u) => {
      if (err) throw err
      userB = u
      process.send({name: 'handshake', data: userB.publicDat.key.toString('hex')})
    })
  },
  // check the handshake from userA and also initiate a handshake with them
  handshake: (userAKey) => {
    checkHandshake(userB, userAKey, (err, userA) => {
      if (err) throw err
      handshake(userB, userAKey, (err, userA) => {
        if (err) throw err
        process.send({name: 'checkHandshake', data: userB.publicDat.key.toString('hex')})
      })
    })
  },
  getDat: (userAID) => {
    getSharedDats(userB, [userAID], (err, dats) => {
      if (err) throw err
      process.send({name: 'done', data: dats})
      close(userB, (err) => { if (err) throw err })
      process.exit(1)
    })
  }
}
