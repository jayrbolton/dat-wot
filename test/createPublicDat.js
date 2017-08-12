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
    createDat(user, datName, (err, user, dat) => {
      if (err) throw err
      t.assert(fs.existsSync(path + '/dats/' + datName + '/.dat'))
      // Make the dat publicly listed
      makeDatPublic(user, datName, (err, user) => {
        if (err) throw err
        t.assert(user.dats[datName], 'sets an entry for the dat on the user')
        t.strictEqual(user.dats[datName].key, dat.key.toString('hex'), 'saves the dat key on the user')
        t.equal(user.dats[datName].instance, dat, 'saves the dat instance on the user')
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
