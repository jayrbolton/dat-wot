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
  setup({path, name: 'jay', pass: 'arstarst'}, (user) => {
    // Test creation of all files
    user.publicDat.close()
    t.assert(fs.existsSync(path), 'creates parent directory')
    t.assert(fs.existsSync(path + '/pass_hash'), 'creates pass_hash')
    t.assert(fs.existsSync(path + '/salt'), 'creates salt')
    t.assert(fs.existsSync(path + '/public/pubkey'), 'creates pubkey')
    t.assert(fs.existsSync(path + '/public/.dat'), 'creates public dat')
    t.assert(user.privKey, 'creates privKey buffer user')
    t.assert(user.pubKey, 'creates pubKey buffer on user')
    t.end()
  })
})

test('load', (t) => {
  // Test load dat
  setup({path: prefix + '/load-test', name: 'jay', pass: 'arstarst'}, (user) => {
    user.publicDat.close()
    load(prefix + '/load-test', 'arstarst', (user) => {
      t.assert(user.pubKey, 'retrieves pubKey')
      t.assert(user.privKey, 'retrieves privKey')
      t.assert(user.publicDat, 'retrieves public dat instance')
      t.assert(user.id, 'retrieves user id')
      user.publicDat.close()
      t.end()
    })
  })
})

test('load - invalid pass', (t) => {
  // Test load dat
  setup({path: prefix + '/load-test', name: 'jay', pass: 'arstarst!'}, (user) => {
    user.publicDat.close()
    load(prefix + '/load-test', 'arstarst', (err, user) => {
      t.deepEqual(err.message, "Password invalid", 'should throw error')
      t.end()
    })
  })
})

test('create public dat', (t) => {
  const path = prefix + '/create-dat-public'
  setup({path, name: 'jay', pass: 'arstarst'}, (user) => {
    user.publicDat.close()
    createDat(user, {name: 'test', public: true}, (dat) => {
      t.assert(fs.existsSync(path + '/dats/test/.dat'))
      const dats = json.read(path + '/public/dats.json')
      t.deepEqual(dats.test, dat.key.toString("hex"))
      dat.close()
      t.end()
    })
  })
})

test('follow', (t) => {
  const path = prefix + '/follow-test'
  fs.ensureDir(path)
  var userA
  const handlers = {
    startFollow: (key) => {
      follow(userA, key, (userA, userB) => {
        const followPath = path + '/userA-base/follows/' + userB.id
        t.assert(fs.existsSync(followPath + '/.dat', 'downloads userBs pub dat'))
        t.assert(fs.existsSync(followPath + '/id', 'downloads userBs id'))
        // close everything down
        userA.publicDat.close()
        child.send({name: 'completed'})
        t.end()
      })
    }
  }
  const child = fork('./test/child-process-follow.js')
  child.on("message", (msg) => {
    const {name, data} = msg
    console.log('child received', name)
    handlers[name](data)
  })
  child.on('close', (code) => console.log(`child process exited with code ${code}`))
  setup({path: path + '/userA-base', name: 'userA', pass: 'arstarst'}, (u) => {
    userA = u
    console.log('finished parent process setup', new Date())
    // Initialize another dat user in a forked process
    child.send({name: 'setup'})
  })
})

test('handshake and checkHandshake', (t) => {
  const path = prefix + '/handshake-test'
  fs.ensureDir(path)
  var userA, relDat, relDatFrom
  const handlers = {
    startHandshake: (key) => {
      handshake(userA, key, (userA, userB, dat) => {
        const followPath = path + '/userA-base/follows/' + userB.id
        t.assert(fs.existsSync(followPath + '/.dat'), 'Follow directory is created with the other users dat')
        t.assert(fs.existsSync(path + '/userA-base/public/handshakes/' + userB.id), 'Encrypted handshake file is created in the public dat')
        t.assert(fs.existsSync(path + '/userA-base/relationships/' + userB.id + '/.dat'), 'Relationship directory with dat is created')
        child.send({name: 'checkAndStartHandshake', data: userA.publicDat.key.toString('hex')})
        relDat = dat
      })
    }
  , checkHandshake: (userBKey) => {
      checkHandshake(userA, userBKey, (userA, userB, dat) => {
        relDatFrom = dat
        child.send({name: 'checkComplete', data: null})
      })
    }
  , checkComplete: (userBID) => {
      t.assert(fs.existsSync(path + '/userA-base/relationships/' + userBID), 'creates the relationships dir for userA->userB' )
      t.assert(fs.existsSync(path + '/userB-base/relationships/from/' + userA.id + '/.dat'))
      child.send({name: 'completed'})
      relDat.close()
      relDatFrom.close()
      userA.publicDat.close()
      t.end()
    }
  }
  const child = fork('./test/child-process-handshake.js')
  child.on("message", (msg) => {
    const {name, data} = msg
    console.log('parent got', name)
    handlers[name](data)
  })
  child.on('close', (code) => console.log(`child process exited with code ${code}`))
  setup({path: path + '/userA-base', name: 'userA', pass: 'arstarst'}, (u) => {
    userA = u
    console.log('parent setup finished')
    child.send({name: 'setup'})
  })
  // Order of events in the above test
  // - parent runs setup
  // - child runs setup
  // - parent runs startHandshake
  // - child runs checkAndStartHandshake
  // - parent runs checkHandshake
  // - child runs checkComplete
  // - parent runs checkComplete
})
