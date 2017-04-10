const test = require('tape')
const fs = require('fs')
const assert = require('assert')
const createDir = require('../lib/utils/create-dir')
const {setup, load, follow, createDat} = require('../')

const prefix = '/tmp/metadat-test'
createDir(prefix)

// TODO 
// - write pgp public key to public metadat
// - read pgp public key from followed users metadat
// - make all user directories postfixed by their public metadat key
// - figure out secure storage of pgp private key

test('setup', (t) => {
  const path = prefix + '/setup-test'
  setup({path, name: 'jay', passphrase: 'arstarst', numBits: 512}, function(user) {
    // Test creation of all files
    t.assert(fs.existsSync(path), 'creates parent directory')
    t.assert(fs.existsSync(path + '/.keys/private.key'), 'creates private key file')
    t.assert(fs.existsSync(path + '/.keys/public.key'), 'creates public key file')
    t.assert(fs.existsSync(path + '/jay/.dat'), 'creates user directory')
    t.assert(fs.existsSync(path + '/jay/public.key'), 'creates public key in pub metadat')
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

test('create public dat', (t) => {
  const path = prefix + '/create-dat-public'
  setup({path, name: 'jay', passphrase: 'arstarst', numBits: 512}, (user) => {
    createDat(user, {name: 'test', public: true}, (metadat) => {
      t.assert(fs.existsSync(path + '/dats/test/.dat'))
      const pubs = JSON.parse(fs.readFileSync(path + '/jay/pub.json'))
      t.deepEqual(pubs, {dats: [metadat.key.toString("hex")]})
      user.publicMetadat.close()
      metadat.close()
      t.end()
    })
  })
})

test('follow', (t) => {
  const path = prefix + '/follow-test'
  createDir(path)
  setup({path: path + '/u1', name: 'u1', passphrase: 'arstarst', numBits: 512}, function(u1) {
    setup({path: path + '/u2', name: 'u2', passphrase: 'arstarst', numBits: 512}, function(u2) {
      follow(u1, u2, (dat) => {
        t.assert(fs.existsSync(path + '/u1/follows/u2/.dat'), 'creates follow dat')
        const pubs = JSON.parse(fs.readFileSync(path + '/u1/u1/pub.json'))
        assert.deepEqual(pubs, {dats: [dat.key.toString('hex')]})
        u1.publicMetadat.close()
        u2.publicMetadat.close()
        dat.close()
        t.end()
      })
    })
  })
})
