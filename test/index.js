const fork = require('child_process').fork
const json = require('../lib/utils/json')
const test = require('tape')
const fs = require('fs')
const assert = require('assert')
const createDir = require('../lib/utils/create-dir')
const {setup, load, follow, createDat, handshake, checkHandshake} = require('../')

const prefix = 'test/tmp'
createDir(prefix)

test('setup', (t) => {
  const path = prefix + '/setup-test'
  setup({path, name: 'jay', passphrase: 'arstarst', numBits: 512}, function(user) {
    // Test creation of all files
    user.publicMetadat.close()
    t.assert(fs.existsSync(path), 'creates parent directory')
    t.assert(fs.existsSync(path + '/' + user.id + '/.dat'), 'creates public metadat')
    t.end()
  })
})

test('load', (t) => {
  // Test load dat
  setup({path: prefix + '/load-test', name: 'jay', passphrase: 'arstarst', numBits: 512}, function(user) {
    user.publicMetadat.close()
    load(prefix + '/load-test', 'arstarst', (user) => {
      t.assert(user.pubKey, 'retrieves pubkey')
      t.assert(user.publicMetadatKey, 'retrieves public metadat')
      t.deepEqual(user.publicDats, [], 'public dat list')
      t.deepEqual(user.relationships, [], 'relationship list')
      t.deepEqual(user.follows, [], 'follows list')
      t.end()
    })
  })
})

test('create public dat', (t) => {
  const path = prefix + '/create-dat-public'
  setup({path, name: 'jay', passphrase: 'arstarst', numBits: 512}, (user) => {
    user.publicMetadat.close()
    createDat(user, {name: 'test', public: true}, (metadat) => {
      t.assert(fs.existsSync(path + '/dats/test/.dat'))
      const json = JSON.parse(fs.readFileSync(path + '/' + user.id + '/user.json'))
      t.deepEqual(json.dats, [metadat.key.toString("hex")])
      metadat.close()
      t.end()
    })
  })
})

test('follow', (t) => {
  const path = prefix + '/follow-test'
  createDir(path)
  const handlers = {
    startFollow: (u1, key, child) => {
      follow(u1, key, (u1, u2) => {
        const followPath = path + '/u1-base/follows/' + u2.id
        t.assert(fs.existsSync(followPath + '/user.json'))
        t.strictEqual(u1.follows[u2.id], followPath)
        // close everything down
        u1.publicMetadat.close()
        child.send({name: 'completed'})
        t.end()
      })
    }
  }
  setup({path: path + '/u1-base', name: 'u1', passphrase: 'arstarst', numBits: 512}, function(u1) {
    // Initialize another dat user in a forked process
    const child = fork('./test/child-process-follow.js')
    child.on("message", (msg) => handlers[msg.name](u1, msg.data, child))
  })
})

test('handshake and checkHandshake', (t) => {
  const path = prefix + '/handshake-test'
  createDir(path)
  const handlers = {
    startHandshake: (u1, key, child) => {
      handshake(u1, key, 'arstarst', (u1, u2) => {
        const followPath = path + '/u1-base/follows/' + u2.id
        t.assert(fs.existsSync(followPath + '/user.json'))
        t.strictEqual(u1.follows[u2.id], followPath)
        t.assert(fs.existsSync(path + '/u1-base/' + u1.id + '/handshakes/' + u2.id + '.txt'))
        t.assert(fs.existsSync(path + '/u1-base/relationships/' + u2.id + '/.dat'))
        // close everything down
        u1.publicMetadat.close()
        child.send({name: 'completed'})
        t.end()
      })
    }
  }
  setup({path: path + '/u1-base', name: 'u1', passphrase: 'arstarst', numBits: 512}, function(u1) {
    // Initialize another dat user in a forked process
    const child = fork('./test/child-process-handshake.js')
    child.on("message", (msg) => handlers[msg.name](u1, msg.data, child))
  })
})
