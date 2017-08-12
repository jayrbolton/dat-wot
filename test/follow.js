const {fork} = require('child_process')
const test = require('tape')
const fs = require('fs-extra')
const {follow, setup, close} = require('../')

// Integration test for the follow function
test('follow', (t) => {
  const path = './test/tmp/follow-test'
  fs.ensureDir(path)
  const child = fork('./test/follow-childProcess.js')
  let userA
  child.on('message', ({name, data}) => handlers[name](data))
  setup({path: path + '/userA', name: 'userA', pass: 'arstarst'}, (err, u) => {
    if (err) throw err
    userA = u
    // Initialize another dat user in a forked process
    child.send({name: 'setup'})
  })

  // Handle messages from ./follow-childProcess.js
  const handlers = {
    startFollow: (key) => {
      follow(userA, key, (err, userB) => {
        if (err) throw err
        const followPath = path + '/userA/follows/' + userB.id
        t.assert(fs.existsSync(followPath + '/.dat'), 'downloads userBs pub dat')
        t.assert(fs.existsSync(followPath + '/id'), 'downloads userBs id')
        close(userA, (err) => { if (err) throw err })
        child.send({name: 'completed'})
        t.end()
      })
    }
  }
})
