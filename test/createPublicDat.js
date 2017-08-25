const test = require('tape')
const json = require('../lib/utils/json')
const fs = require('fs-extra')
const {makeDatPublic, createDat, setup, close} = require('../')

const path = './test/tmp/createPublicDat/'
const datName = 'public-test-dat'

test('create public dat', (t) => {
  setup({path, name: 'finn', pass: 'arstarst'}, (err, user) => {
    if (err) throw err
    // Create a new empty & private dat
    createDat(user, datName, (err, dat) => {
      if (err) throw err
      t.assert(fs.existsSync(path + '/dats/' + datName + '/.dat'))
      t.assert(user.dats[datName], 'sets an entry for the dat on the user')
      t.strictEqual(user.dats[datName].public, false, 'dat is not marked as public initially')
      t.equal(user.dats[datName].instance, dat, 'saves the dat instance on the user')
      // Make the dat publicly listed
      makeDatPublic(user, datName, (err) => {
        if (err) throw err
        t.assert(user.dats[datName].public, 'marks the dat under the user as public')
        json.read(path + '/public/dats.json', (err, dats) => {
          if (err) throw err
          t.deepEqual(dats['public-test-dat'].key, dat.key.toString('hex'), 'saves the dat key to their public dats.json')
          close(user, (err) => { if (err) throw err })
          t.end()
        })
      })
    })
  })
})
