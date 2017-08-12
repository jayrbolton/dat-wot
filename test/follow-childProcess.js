const {close, setup} = require('../')
const path = './test/tmp/follow-test'
let userB

process.on('message', ({name, data}) => handlers[name](data))

const handlers = {
  completed: () => {
    close(userB, err => { if (err) throw err })
    process.exit(1)
  },
  setup: () => {
    setup({path: path + '/userB', name: 'finn', pass: 'arstarst'}, (err, u) => {
      if (err) throw err
      userB = u
      process.send({name: 'startFollow', data: userB.publicDat.key.toString('hex')})
    })
  }
}
