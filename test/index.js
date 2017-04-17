const fork = require('child_process').fork
const json = require('../lib/utils/json')
const test = require('tape')
const fs = require('fs')
const assert = require('assert')
const createDir = require('../lib/utils/create-dir')
const {setup, load, follow, createDat, handshake, checkHandshake} = require('../')

const prefix = '/tmp/metadat-test'
createDir(prefix)

test('setup', (t) => {
  const path = prefix + '/setup-test'
  setup({path, name: 'jay', passphrase: 'arstarst', numBits: 512}, function(user) {
    // Test creation of all files
    t.assert(fs.existsSync(path), 'creates parent directory')
    t.assert(fs.existsSync(path + '/' + user.id + '/.dat'), 'creates public metadat')
    t.end()
  })
})

test('load', (t) => {
  // Test load dat
  setup({path: prefix + '/load-test', name: 'jay', passphrase: 'arstarst', numBits: 512}, function(user) {
    user.publicMetadat.close(function() {
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
})

test('create public dat', (t) => {
  const path = prefix + '/create-dat-public'
  setup({path, name: 'jay', passphrase: 'arstarst', numBits: 512}, (user) => {
    createDat(user, {name: 'test', public: true}, (metadat) => {
      t.assert(fs.existsSync(path + '/dats/test/.dat'))
      const json = JSON.parse(fs.readFileSync(path + '/' + user.id + '/user.json'))
      t.deepEqual(json.dats, [metadat.key.toString("hex")])
      metadat.close()
      t.end()
    })
  })
})

// TODO
test.skip('follow', (t) => {
  const path = prefix + '/follow-test'
  createDir(path)
  setup({path: path + '/u1-base', name: 'u1', passphrase: 'arstarst', numBits: 512}, function(u1) {
    const handlers = {
      startFollow: (u1, key) => {
        follow(u1, key, (dat, u1, u2) => {
          const followPath = path + '/u1-base/follows/' + u2.id
          t.assert(fs.existsSync(followPath + '/user.json'))
          t.strictEqual(u1.follows[u2.id], followPath)
          dat.close()
          child.kill()
          t.end()
        })
      }
    }
    // Initialize another dat user in a forked process
    const child = fork('./test/child-process-follows.js')
    child.on("message", (msg) => {
      const {name, data} = msg
      handlers[name](u1, data)
    })
  })
})

// TODO
test.skip('handshake and checkHandshake', (t) => {
  const path = prefix + '/handshake-test'
  createDir(path)
  setup({path: path, name: 'u1', passphrase: 'arstarst', numBits: 512}, function(u1) {
    u1.publicMetadat.importFiles({watch: true})
    u1.publicMetadat.joinNetwork()

    const handlers = {
      // Child process has finished setting up its user
      startHandshake: (u1, childKey) => {
        console.log('parent starting handshake')
        handshake(u1, childKey, 'arstarst', (dat, userA, userB) => {
          const followPath = path + '/follows/' + userB.id
          t.assert(fs.existsSync(followPath + '/user.json'))
          t.strictEqual(userA.follows[userB.id], followPath)
          const relPath = path + '/relationships/' + userB.id + '/.dat'
          t.assert(fs.existsSync(relPath))
          t.assert(fs.existsSync(userA.dirs.pub + '/handshakes/' + userB.id + '.txt'))
          child.send({name: 'startHandshake', data: u1.publicMetadatKey})
        })
      }
      // Child process has also initiated handshake
    , handshakeComplete: (u1, u2id) => {
        const u2 = json.read(u1.dirs.follows + '/' + u2id + '/user.json')
        child.send({name: 'checkHandshake', data: u1.id})
        checkHandshake(u1, u2)
        child.kill()
        u1.publicMetadat.close()
        t.end()
      }
    }

    // Initialize another dat user in a forked process
    const child = fork('./test/child-process-handshake.js')
    child.on("message", (msg) => {
      const {name, data} = msg
      handlers[name](u1, data)
    })
    child.on("error", (err) => {
      console.log('child process error' , err)
    })
  })

})
