const test = require('tape')
const fs = require('fs')
const assert = require('assert')
const createDir = require('../lib/create-dir')
const {setup, load, follow, create} = require('../')

const prefix = '/tmp/metadat-test'
createDir(prefix)

test('setup', (t) => {
  setup({path: prefix + '/setup-test', name: 'jay', passphrase: 'arstarst', numBits: 512}, function(user) {
    // Test creation of all files
    t.assert(fs.existsSync('/tmp/metadat-test/setup-test'), 'Creates parent directory')
    t.assert(fs.existsSync('/tmp/metadat-test/setup-test/.keys/private.key'), 'creates private key file')
    t.assert(fs.existsSync('/tmp/metadat-test/setup-test/.keys/public.key'), 'creates public key file')
    t.assert(fs.existsSync('/tmp/metadat-test/setup-test/jay'), 'creates user directory')
    t.assert(fs.existsSync('/tmp/metadat-test/setup-test/jay/.dat'), 'user directory is a dat')
    user.publicMetadat.close()
    t.end()
  })
})

test('load', (t) => {
  // Test load dat
  setup({path: prefix + '/load-test', name: 'jay', passphrase: 'arstarst', numBits: 512}, function(user) {
    user.publicMetadat.close(function() {
      load(prefix + '/load-test', 'arstarst', (user) => {
        t.assert(user.publicKeyArmored, 'retrieves pubkey')
        t.assert(user.publicMetadat, 'retrieves pubkey')
        t.deepEqual(user.publicDats, [], 'public dat list')
        t.deepEqual(user.relationships, [], 'relationship list')
        t.deepEqual(user.follows, [], 'follows list')
        t.end()
      })
    })
  })
})

test.only('create.public', (t) => {
  setup({path: prefix + '/create.public', name: 'jay', passphrase: 'arstarst', numBits: 512}, (user) => {
    create(user, {name: 'test', public: true}, (metadat) => {
    })
  })
})

test('follow', (t) => {
  const path = prefix + '/follow-test'
  createDir(path)
  setup({path: path + '/u1', name: 'u1', passphrase: 'arstarst', numBits: 512}, function(u1) {
    setup({path: path + '/u2', name: 'u2', passphrase: 'arstarst', numBits: 512}, function(u2) {
      follow(u1, u2, () => {
        t.assert(fs.existsSync(path + '/u1/u2/.dat'))
        u1.publicMetadat.close()
        u2.publicMetadat.close()
        t.end()
      })
    })
  })
})
