const fork = require('child_process').fork
const json = require('../lib/utils/json')
const test = require('tape')
const fs = require('fs-extra')
const waterfall = require('run-waterfall')

const {setup, createDat, shareDat, handshake, checkHandshake, close} = require('../')
const prefix = 'test/tmp'
fs.ensureDir(prefix)

// Integration tests for creating a new dat for a certain contacts/groups

// sequence of events for this test
// - parent sets up user
// - child sets up user
// - parent handshakes child
// - child handshakes parent
// - parent checks handshake for child
// - child checks handshake for parent
// - parent shares dat with child
// - child finds and downloads dat
test('createDat for contact', (t) => {
  // Parent directory of test folders, files, and dats for this test
  const path = prefix + '/createDat-test'
  fs.ensureDir(path)
  let userA, userB, sharedDat
  const child = fork('./test/createDat-childProcess.js')
  // Handle messages from the child process to this parent process
  child.on('message', ({name, data}) => handlers[name](data))
  child.on('close', (code) => console.log(`child process exited with code ${code}`))
  // Set up userA
  setup({path: path + '/userA-base', name: 'userA', pass: 'arstarst'}, (err, u) => {
    if (err) throw err
    userA = u
    child.send({name: 'setup'})
  })
  const handlers = {
    handshake: (userBKey) => {
      handshake(userA, userBKey, (err, userB) => {
        if (err) throw err
        child.send({name: 'handshake', data: userA.publicDat.key.toString('hex')})
      })
    },
    checkHandshake: (userBKey) => {
      waterfall([
        cb => checkHandshake(userA, userBKey, cb),
        (u, dat, cb) => {
          userB = u
          createDat(userA, 'userAShare', cb)
        },
        (dat, cb) => {
          sharedDat = dat
          t.assert(fs.existsSync(path + '/userA-base/dats/userAShare/.dat'), 'creates dat dir')
          shareDat(userA, 'userAShare', [userB.id], cb)
        },
        (_, cb) => {
          json.read(path + '/userA-base/relationships/' + userB.id + '/dats.json', cb)
        }
      ], (err, dats) => {
        if (err) throw err
        t.deepEqual(dats.userAShare, sharedDat.key.toString('hex'), 'puts dat key in push-rel-dat')
        child.send({name: 'getDat', data: userA.id})
      })
    },
    done: (dats) => {
      t.strictEqual(dats[userA.id].userAShare, sharedDat.key.toString('hex'), 'fetches the shared dat')
      close(userA, (err) => { if (err) throw err })
      t.end()
    }
  }
})
