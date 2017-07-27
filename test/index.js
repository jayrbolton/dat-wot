const fork = require('child_process').fork
const json = require('../lib/utils/json')
const test = require('tape')
const fs = require('fs-extra')
const assert = require('assert')
const {setup, load, follow, createPublicDat, handshake, checkHandshake} = require('../')

const prefix = 'test/tmp'
fs.ensureDir(prefix)

test('setup', (t) => {
  const path = prefix + '/setup-test'
  setup({path, name: 'jay', pass: 'arstarst'}, (err, user) => {
    if (err) throw err
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
  const path = prefix + '/load-test'
  setup({path, name: 'jay', pass: 'arstarst'}, (err, user) => {
    if (err) throw err
    user.publicDat.close()
    load(path, 'arstarst', (err, user) => {
      if (err) throw err
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
  setup({path: prefix + '/load-test', name: 'jay', pass: 'arstarst!'}, (err, user) => {
    user.publicDat.close()
    load(prefix + '/load-test', 'arstarst', (err, user) => {
      t.deepEqual(err.message, "Password invalid", 'should throw error')
      t.end()
    })
  })
})

test('create public dat', (t) => {
  const path = prefix + '/create-dat-public'
  setup({path, name: 'jay', pass: 'arstarst'}, (err, user) => {
    if (err) throw err
    user.publicDat.close()
    createPublicDat(user, 'test', (err, dat) => {
      if (err) throw err
      t.assert(fs.existsSync(path + '/dats/test/.dat'))
      json.read(path + '/public/dats.json', (err, dats) => {
        t.deepEqual(dats.test, dat.key.toString("hex"))
        dat.close()
        t.end()
      })
    })
  })
})

test('follow', (t) => {
  const path = prefix + '/follow-test'
  fs.ensureDir(path)
  let userA
  const child = fork('./test/child-process-follow.js')
  child.on("message", ({name, data}) => handlers[name](data))
  child.on('close', (code) => console.log(`child process exited with code ${code}`))
  setup({path: path + '/userA-base', name: 'userA', pass: 'arstarst'}, (err, u) => {
    if (err) throw err
    userA = u
    // Initialize another dat user in a forked process
    child.send({name: 'setup'})
  })
  const handlers = {
    startFollow: (key) => {
      follow(userA, key, (err, userB) => {
        if (err) throw err
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
})

test('handshake and checkHandshake', (t) => {
  const path = prefix + '/handshake-test'
  fs.ensureDir(path)
  var userA, relDat, relDatFrom
  // Order of events in this test:
  // - parent runs setup
  // - child runs setup
  // - parent runs startHandshake
  // - child runs checkAndStartHandshake
  // - parent runs checkHandshake
  // - child runs checkComplete
  // - parent runs checkComplete
  const child = fork('./test/child-process-handshake.js')
  child.on("message", ({name, data}) => handlers[name](data))
  child.on('close', (code) => console.log(`child process exited with code ${code}`))
  setup({path: path + '/userA-base', name: 'userA', pass: 'arstarst'}, (err, u) => {
    if (err) throw err
    userA = u
    child.send({name: 'setup'})
  })
  const handlers = {
    startHandshake: (key) => {
      handshake(userA, key, (err, userB, dat) => {
        if (err) throw err
        const followPath = path + '/userA-base/follows/' + userB.id
        t.assert(fs.existsSync(followPath + '/.dat'), 'Follow directory is created with the other users dat')
        t.assert(fs.existsSync(path + '/userA-base/public/handshakes/' + userB.id), 'Encrypted handshake file is created in the public dat')
        child.send({name: 'checkAndStartHandshake', data: userA.publicDat.key.toString('hex')})
        relDat = dat
      })
    }
  , checkHandshake: (userBKey) => {
      checkHandshake(userA, userBKey, (err, userB, dat) => {
        if (err) throw err
        relDatFrom = dat
        child.send({name: 'checkComplete', data: null})
      })
    }
  , checkComplete: (userBID) => {
      child.send({name: 'completed'})
      t.assert(fs.existsSync(path + '/userA-base/relationships/' + userBID + '/.dat'), 'sets up push rel dat for userA->userB')
      t.assert(fs.existsSync(path + '/userA-base/relationships/from/' + userBID + '/.dat'), 'sets up read rel dat for userB->userA')
      t.assert(fs.existsSync(path + '/userB-base/relationships/from/' + userA.id + '/.dat'), 'sets up read rel dat for userA->userB')
      t.assert(fs.existsSync(path + '/userB-base/relationships/' + userA.id + '/.dat'), 'sets up push rel dat for userB->userA')
      relDat.close()
      relDatFrom.close()
      userA.publicDat.close()
      t.end()
    }
  }
})
