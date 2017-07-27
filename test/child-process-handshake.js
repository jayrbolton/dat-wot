const json = require('../lib/utils/json')
const {setup, handshake, checkHandshake} = require('../')

let path = 'test/tmp/handshake-test'
let userB, relDatFrom, relDat
process.on('message', ({name, data}) => handlers[name](data))

const handlers = {
  setup: () => {
    setup({path: path + '/userB-base', name: 'userB', pass: 'arstarst'}, (err, u) => {
      if (err) throw err
      userB = u
      process.send({name: 'startHandshake', data: userB.publicDat.key.toString('hex')})
    })
  }
, checkAndStartHandshake: (key) => {
    checkHandshake(userB, key, (err, userA, dat) => {
      if (err) throw err
      relDatFrom = dat
      handshake(userB, key, (err, userA, dat) => {
        if (err) throw err
        relDat = dat
        process.send({name: 'checkHandshake', data: userB.publicDat.key.toString('hex')})
      })
    })
  }
, checkComplete: () => {
    userB.publicDat.close()
    relDatFrom.close()
    relDat.close()
    process.send({name: 'checkComplete', data: userB.id})
    process.exit(1)
  }
}
