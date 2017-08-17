const {fork} = require('child_process')
const test = require('tape')
const fs = require('fs-extra')
const {follow, setup, getPublicDats, close} = require('../')

// Integration test for the follow function
test('follow', (t) => {
  const path = './test/tmp/follow-test'
  fs.ensureDir(path)
  const child = fork('./test/follow-childProcess.js')
  let userA
  let userB
  child.on('message', ({name, data}) => handlers[name](data))
  child.on('message', ({name, data}) => console.log('parent process received', name))
  setup({path: path + '/userA', name: 'userA', pass: 'arstarst'}, (err, u) => {
    if (err) throw err
    userA = u
    // Initialize another dat user in a forked process
    child.send({name: 'setup'})
  })

  // Handle messages from ./follow-childProcess.js
  const handlers = {
    startFollow: (key) => {
      follow(userA, key, (err, uB) => {
        if (err) throw err
        userB = uB
        const followPath = path + '/userA/follows/' + userB.id
        t.assert(fs.existsSync(followPath + '/.dat'), 'downloads userBs pub dat')
        t.assert(fs.existsSync(followPath + '/id'), 'downloads userBs id')
        child.send({name: 'createDat', data: null})
      })
    },
    listDats: (datKey) => {
      getPublicDats(userA, userB, (err, dats) => {
        if (err) throw err
        t.strictEqual(dats.test.key, datKey)
        close(userA, (err) => { if (err) throw err })
        child.send({name: 'completed'})
        t.end()
      })
    }
  }
})
