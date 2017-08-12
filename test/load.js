const test = require('tape')
const {load, setup, close} = require('../')

const path = './test/tmp/load'

test('load', (t) => {
  setup({path, name: 'finn', pass: 'arstarst'}, (err, user) => {
    if (err) throw err
    close(user, (err) => { if (err) throw err })
    load(path, 'arstarst', (err, user) => {
      if (err) throw err
      t.assert(user.pubKey, 'retrieves pubKey')
      t.assert(user.privKey, 'retrieves privKey')
      t.assert(user.publicDat, 'retrieves public dat instance')
      t.assert(user.id, 'retrieves user id')
      close(user, (err) => { if (err) throw err })

      // Test for invalid passwords
      load(path, 'arstarst!', (errrr, user) => {
        t.deepEqual(errrr.message, 'Password invalid', 'should throw error')
        t.deepEqual(user, undefined, 'does not instantiate any user obj')
        t.end()
      })
    })
  })
})
