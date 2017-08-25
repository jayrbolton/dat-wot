const {fork} = require('child_process')
const fs = require('fs-extra')
const test = require('tape')
const {setup, handshake, checkHandshake, close} = require('../')

const path = './test/tmp/handshake'
fs.ensureDir(path)

// Integration testing for the handshake and test handshake functions

test('handshake and checkHandshake', (t) => {
  let userA
  // Order of events in this test:
  // - parent runs setup
  // - child runs setup
  // - parent runs startHandshake
  // - child runs checkAndStartHandshake
  // - parent runs checkHandshake
  // - child runs checkComplete
  // - parent runs checkComplete
  const child = fork('./test/handshake-childProcess.js')
  child.on('message', ({name, data}) => handlers[name](data))
  setup({path: path + '/userA', name: 'userA', pass: 'arstarst'}, (err, u) => {
    if (err) throw err
    userA = u
    child.send({name: 'setup'})
  })
  child.on('message', ({name, data}) => console.log('parent process received', name))

  const handlers = {
    startHandshake: (key) => {
      handshake(userA, key, (err, userB, dat) => {
        if (err) throw err
        const followPath = path + '/userA/follows/' + userB.id
        t.assert(fs.existsSync(followPath + '/.dat'), 'Follow directory is created with the other users dat')
        t.assert(fs.existsSync(path + '/userA/public/handshakes/' + userB.id), 'Encrypted handshake file is created in the public dat')
        child.send({name: 'checkAndStartHandshake', data: userA.publicDat.key.toString('hex')})
      })
    },

    checkHandshake: (userBKey) => {
      checkHandshake(userA, userBKey, (err, userB, dat) => {
        if (err) throw err
        child.send({name: 'checkComplete', data: null})
      })
    },

    checkComplete: (userBID) => {
      child.send({name: 'completed'})
      t.assert(fs.existsSync(path + '/userA/relationships/' + userBID + '/.dat'), 'sets up push rel dat for userA->userB')
      t.assert(fs.existsSync(path + '/userA/relationships/from/' + userBID + '/.dat'), 'sets up read rel dat for userB->userA')
      t.assert(fs.existsSync(path + '/userB/relationships/from/' + userA.id + '/.dat'), 'sets up read rel dat for userA->userB')
      t.assert(fs.existsSync(path + '/userB/relationships/' + userA.id + '/.dat'), 'sets up push rel dat for userB->userA')
      close(userA, err => { if (err) throw err })
      t.end()
    }
  }
})
