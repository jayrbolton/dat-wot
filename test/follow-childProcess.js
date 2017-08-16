const {close, setup, createDat, makeDatPublic} = require('../')
const path = './test/tmp/follow-test'
let userB

process.on('message', ({name, data}) => handlers[name](data))
process.on('message', ({name, data}) => console.log('child process received', name))

// Handle messages from test/follow.js
const handlers = {
  setup: () => {
    setup({path: path + '/userB', name: 'finn', pass: 'arstarst'}, (err, u) => {
      if (err) throw err
      userB = u
      process.send({name: 'startFollow', data: userB.publicDat.key.toString('hex')})
    })
  },
  createDat: () => {
    createDat(userB, 'test', (err, uB, dat) => {
      if (err) throw err
      makeDatPublic(userB, 'test', (err, uB) => {
        if (err) throw err
        userB = uB
        process.send({name: 'listDats', data: dat.key.toString('hex')})
      })
    })
  },
  completed: () => {
    close(userB, err => { if (err) throw err })
    process.exit(1)
  }
}
