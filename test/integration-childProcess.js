const pki = require('../')

const path = './test/tmp'
let userB
process.on('message', ({name, data}) => {
  console.log('userB running', name)
  handlers[name](data)
})
const handleErr = err => {
  if (!err) return
  process.send({name: 'done', err}) // parent process will trigger our own handlers.done()
  pki.close(userB, err => { handleErr(err) })
  throw err
}

const handlers = {

  setup: () => {
    pki.setup({path: path + '/userB', name: 'userB', pass: 'arstarst'}, (err, u) => {
      handleErr(err)
      userB = u
      process.send({name: 'loadUserAndRunDaemon'})
    })
  },

  startRunning: (userAProfileDatKey) => {
    pki.run(userB, function (err) {
      handleErr(err)
      pki.sendContactRequest(userB, userAProfileDatKey)
      pki.follow(userB, userAProfileDatKey, function (err, file) {
        handleErr(err)
        console.log('fire!', file)
      })
    })
  },

  // Create a public dat for userA to find & list
  createPublicDat: () => {
    pki.createDat(userB, 'userBPubDat', (err, dat) => {
      handleErr(err)
      pki.makeDatPublic(userB, 'userBPubDat', (err) => {
        handleErr(err)
        process.send({name: 'listDats', data: dat.key.toString('hex')})
      })
    })
  },

  // Check the handshake from userB and start one for userB->userA
  checkAndStartHandshake: (key) => {
    pki.checkHandshake(userB, key, (err, userA) => {
      handleErr(err)
      pki.handshake(userB, key, (err, userA, dat) => {
        handleErr(err)
        process.send({name: 'checkHandshake', data: userB.publicDat.key.toString('hex')})
      })
    })
  },

  // Fetch the private dat shared from userA
  getPrivateDat: (userAID) => {
    pki.getSharedDats(userB, [userAID], (err, dats) => {
      handleErr(err)
      process.send({name: 'checkSharedDats', data: dats})
    })
  },

  done: () => {
    pki.close(userB, err => { handleErr(err) })
    process.exit(1)
  }
}
