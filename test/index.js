const fork = require('child_process').fork
const json = require('../lib/utils/json')
const test = require('tape')
const fs = require('fs-extra')
const assert = require('assert')
const {setup, load, follow, createDat, handshake, checkHandshake} = require('../')

const prefix = 'test/tmp'
fs.ensureDir(prefix)

test('setup', (t) => {
  const path = prefix + '/setup-test'
  setup({path, name: 'jay', passphrase: 'arstarst'}, (user) => {
    // Test creation of all files
    user.publicDat.close()
    t.assert(fs.existsSync(path), 'creates parent directory')
    t.assert(fs.existsSync(path + '/privkey'), 'creates privkey')
    t.assert(fs.existsSync(path + '/public/pubkey'), 'creates pubkey')
    t.assert(fs.existsSync(path + '/public/.dat'), 'creates public dat')
    t.end()
  })
})

test('load', (t) => {
  // Test load dat
  setup({path: prefix + '/load-test', name: 'jay', passphrase: 'arstarst'}, (user) => {
    user.publicDat.close()
    load(prefix + '/load-test', 'arstarst', (user) => {
      t.assert(user.pubKey, 'retrieves pubKey')
      t.assert(user.privKey, 'retrieves privKey')
      t.assert(user.publicDat, 'retrieves public dat instance')
      t.assert(user.id, 'retrieves user id')
      t.end()
    })
  })
})

test('create public dat', (t) => {
  const path = prefix + '/create-dat-public'
  setup({path, name: 'jay', passphrase: 'arstarst'}, (user) => {
    user.publicDat.close()
    createDat(user, {name: 'test', public: true}, (dat) => {
      t.assert(fs.existsSync(path + '/dats/test/.dat'))
      const json = JSON.parse(fs.readFileSync(path + '/public/user.json'))
      t.deepEqual(json.dats, [dat.key.toString("hex")])
      dat.close()
      t.end()
    })
  })
})

test('follow', (t) => {
  const path = prefix + '/follow-test'
  var user1
  fs.ensureDir(path)
  const handlers = {
    startFollow: (key, child) => {
      follow(user1, key, (u1, u2) => {
        const followPath = path + '/u1-base/follows/' + u2.name + '-' + u2.id
        t.assert(fs.existsSync(followPath + '/user.json'))
        t.strictEqual(u1.follows[u2.id], followPath)
        // close everything down
        user1.publicDat.close()
        child.send({name: 'completed'})
        t.end()
      })
    }
  }
  const child = fork('./test/child-process-follow.js')
  child.on("message", (msg) => handlers[msg.name](msg.data, child))
  child.on('close', (code) => console.log(`child process exited with code ${code}`))
  setup({path: path + '/u1-base', name: 'u1', passphrase: 'arstarst'}, (u1) => {
    user1 = u1
    console.log('finished parent process setup', new Date())
    // Initialize another dat user in a forked process
    child.send({name: 'setup'})
  })
})

test.only('handshake and checkHandshake', (t) => {
  const path = prefix + '/handshake-test'
  var userA, userARelDat
  fs.ensureDir(path)
  const handlers = {
    startHandshake: (key) => {
      handshake(userA, key, (userA, userB, dat) => {
        const followPath = path + '/userA-base/follows/' + userB.id
        t.assert(fs.existsSync(followPath + '/.dat'), 'Follow directory is created with the other users dat')
        t.assert(fs.existsSync(path + '/userA-base/public/handshakes/' + userB.id), 'Encrypted handshake file is created in the public dat')
        t.assert(fs.existsSync(path + '/userA-base/relationships/' + userB.id + '/.dat'), 'Relationship directory with dat is created')
        setTimeout(() => {
          child.send({name: 'checkHandshake', data: userA.publicDat.key.toString('hex')})
          userARelDat = dat
        }, 1000)
      })
    }
  , checkComplete: ({userB, relDat}) => {
      setTimeout(() => {
        t.assert(fs.existsSync(path + '/userA-base/relationships/' + userB.id))
        t.assert(fs.existsSync(path + '/userB-base/relationships/from/' + userA.id + '/.dat'))
        child.send({name: 'completed'})
        userARelDat.close()
        userA.publicDat.close()
        t.end()
      }, 1000)
    }
  }
  const child = fork('./test/child-process-handshake.js')
  child.on("message", (msg) => {
    const {name, data} = msg
    console.log('parent got', name, 'with data', data)
    handlers[name](data)
  })
  child.on('close', (code) => console.log(`child process exited with code ${code}`))
  setup({path: path + '/userA-base', name: 'userA', passphrase: 'arstarst'}, (u) => {
    userA = u
    console.log('parent setup finished')
    child.send({name: 'setup'})
  })
  // Order of events in the above test
  // - parent runs setup
  // - child runs setup
  // - parent runs startHandshake
  // - child runs checkHandshake
  // - parent runs checkComplete
})
