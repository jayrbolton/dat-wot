const fork = require('child_process').fork
const json = require('../lib/utils/json')
const test = require('tape')
const fs = require('fs')
const assert = require('assert')
const createDir = require('../lib/utils/createDir')
const {setup, load, follow, createDat, handshake, checkHandshake} = require('../')

const prefix = 'test/tmp'
createDir(prefix)

test('setup', (t) => {
  const path = prefix + '/setup-test'
  setup({path, name: 'jay', passphrase: 'arstarst'}, (user) => {
    // Test creation of all files
    user.publicMetadat.close()
    t.assert(fs.existsSync(path), 'creates parent directory')
    t.assert(fs.existsSync(path + '/privkey'), 'creates privkey')
    t.assert(fs.existsSync(path + '/public/pubkey'), 'creates pubkey')
    t.assert(fs.existsSync(path + '/public/.dat'), 'creates public metadat')
    t.end()
  })
})

test('load', (t) => {
  // Test load dat
  setup({path: prefix + '/load-test', name: 'jay', passphrase: 'arstarst'}, (user) => {
    user.publicMetadat.close()
    load(prefix + '/load-test', 'arstarst', (user) => {
      t.assert(user.pubKey, 'retrieves pubKey')
      t.assert(user.privKey, 'retrieves privKey')
      t.assert(user.publicMetadat, 'retrieves public metadat instance')
      t.assert(user.id, 'retrieves user id')
      t.end()
    })
  })
})

test('create public dat', (t) => {
  const path = prefix + '/create-dat-public'
  setup({path, name: 'jay', passphrase: 'arstarst'}, (user) => {
    user.publicMetadat.close()
    createDat(user, {name: 'test', public: true}, (metadat) => {
      t.assert(fs.existsSync(path + '/dats/test/.dat'))
      const json = JSON.parse(fs.readFileSync(path + '/public/user.json'))
      t.deepEqual(json.dats, [metadat.key.toString("hex")])
      metadat.close()
      t.end()
    })
  })
})

test('follow', (t) => {
  const path = prefix + '/follow-test'
  var user1
  createDir(path)
  const handlers = {
    startFollow: (key, child) => {
      follow(user1, key, (u1, u2) => {
        console.log("in: parent process startFollow")
        const followPath = path + '/u1-base/follows/' + u2.name + '-' + u2.id
        t.assert(fs.existsSync(followPath + '/user.json'))
        t.strictEqual(u1.follows[u2.id], followPath)
        // close everything down
        user1.publicMetadat.close()
        child.send({name: 'completed'})
        t.end()
      })
    }
  }
  const child = fork('./test/child-process-follow.js')
  child.on("message", (msg) => handlers[msg.name](msg.data, child))
  child.on('close', (code) =>console.log(`child process exited with code ${code}`))
  setup({path: path + '/u1-base', name: 'u1', passphrase: 'arstarst'}, (u1) => {
    user1 = u1
    console.log('finished parent process setup', new Date())
    // Initialize another dat user in a forked process
    child.send({name: 'setup'})
  })
})

test.only('handshake and checkHandshake', (t) => {
  const path = prefix + '/handshake-test'
  var user1
  var relationshipDat = null
  createDir(path)
  const handlers = {
    startHandshake: (key) => {
      handshake(user1, key, (dat, u1, u2) => {
        const followPath = path + '/u1-base/follows/' + u2.name + '-' + u2.id
        t.assert(fs.existsSync(followPath + '/user.json'), 'Follow directory is created with the other users dat')
        t.strictEqual(u1.follows[u2.id], followPath, 'Follower entry is added')
        t.assert(fs.existsSync(path + '/u1-base/public/handshakes/' + u2.id), 'Encrypted handshake file is created in the public metadat')
        t.assert(fs.existsSync(path + '/u1-base/relationships/' + u2.name + '-' + u2.id + '/.dat'), 'Relationship directory with dat is created')
        console.log('checking handshake', u1.publicMetadat.key.toString('hex'))
        child.send({name: 'checkHandshake', data: u1.publicMetadat.key.toString('hex')})
        relationshipDat = dat
      })
    }
  , checkComplete: (relationships) => {
      t.assert(relationships[user1.id] && relationships[user1.id].path, 'Creates a relationship entry in user.json')
      child.send({name: 'completed'})
      user1.publicMetadat.close()
      relationshipDat.close()
      t.end()
    }
  , handShakeComplete: () => { console.log('handshake complete') }
  }
  const child = fork('./test/child-process-handshake.js')
  child.on("message", (msg) => {
    console.log('got', msg.name)
    handlers[msg.name](msg.data)
  })
  child.on('close', (code) => console.log(`child process exited with code ${code}`))
  setup({path: path + '/u1-base', name: 'u1', passphrase: 'arstarst'}, (u) => {
    user1 = u
    console.log('setup returned')
    child.send({name: 'setup'})
  })
})
