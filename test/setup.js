const fs = require('fs-extra')
const test = require('tape')
const {setup, close} = require('../')

const path = './test/tmp/setup'
test('setup', (t) => {
  setup({path, name: 'userA', pass: 'asrtarst'}, (err, user) => {
    if (err) throw err
    // Test creation of all files
    close(user, (err) => {
      if (err) throw err
    })
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
