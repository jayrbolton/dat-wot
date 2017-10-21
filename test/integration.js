const {fork} = require('child_process')
const fs = require('fs-extra')
const test = require('tape')
const pki = require('../')
const waterfall = require('run-waterfall')
const json = require('../lib/utils/json')

// Big integration test that simulates two users---userA and userB---in forked processes

const path = './test/tmp'
fs.ensureDir(path)

// Order of events in this test:
// - parent runs setup
// - child runs setup
// - parent runs startHandshake
// - child runs checkAndStartHandshake
// - parent runs checkHandshake
// - child runs checkComplete
// - parent runs checkComplete

test('integration', (t) => {
  var userA, userB, sharedDat
  const child = fork('./test/integration-childProcess.js')
  const handleErr = err => {
    if (!err) return
    child.send({name: 'done'})
    pki.close(userA, err => { handleErr(err) })
    throw err
  }
  child.on('message', ({name, data}) => {
    handlers[name](data)
  })
  pki.setup({path: path + '/userA', name: 'userA', pass: 'arstarst'}, (err, u) => {
    handleErr(err)
    userA = u
    child.send({name: 'setup'})
  })

  const handlers = {
    // Follow userB
    startFollow: (userBKey) => {
      pki.follow(userA, userBKey, (err, uB) => {
        handleErr(err)
        userB = uB
        const followPath = path + '/userA/follows/' + userB.id
        const id = fs.readFileSync(followPath + '/id', 'utf8')
        const pubkey = fs.readFileSync(followPath + '/pubkey')
        t.strictEqual(id, userB.id, 'downloads userBs ids')
        t.strictEqual(pubkey.toString('hex'), userB.pubkey.toString('hex'), 'downloads userBs pubkey')
        child.send({name: 'createPublicDat', data: null})
      })
    },

    // List public dats for userB
    // Then, start a handshake for userA->userB
    listDats: (datKey) => {
      pki.getPublicDats(userA, userB, (err, dats) => {
        handleErr(err)
        t.strictEqual(dats.userBPubDat.key, datKey)
        pki.handshake(userA, userB.publicDatKey, (err, userB, dat) => {
          handleErr(err)
          t.assert(fs.existsSync(path + '/userA/public/handshakes/' + userB.id), 'Encrypted handshake file is created in the public dat')
          child.send({name: 'checkAndStartHandshake', data: userA.publicDat.key.toString('hex')})
        })
      })
    },

    // Check the handshake for userB->userA
    // Then, create a private dat and share it with userB
    checkHandshake: (userBKey) => {
      const datsFrom = JSON.parse(fs.readFileSync(userA.path + '/relationships/' + userB.id + '/dats.json'))
      const datsTo = JSON.parse(fs.readFileSync(`${path}/userB/relationships/from/${userA.id}/dats.json`))
      t.deepEqual(datsFrom, datsTo, 'sets push rel dat for userA->userB')
      waterfall([
        cb => pki.checkHandshake(userA, userBKey, cb),
        (u, cb) => {
          userB = u
          pki.createDat(userA, 'userAShare', cb)
        },
        (dat, cb) => {
          sharedDat = dat
          t.assert(fs.existsSync(path + '/userA/dats/userAShare/.dat'), 'creates dat dir')
          pki.shareDat(userA, 'userAShare', [userB.id], cb)
        },
        (_, cb) => {
          json.read(`${path}/userA/relationships/${userB.id}/dats.json`, cb)
        }
      ], (err, dats) => {
        handleErr(err)
        t.strictEqual(dats.userAShare, sharedDat.key.toString('hex'), 'puts dat key in push-rel-dat')
        child.send({name: 'getPrivateDat', data: userA.id})
      })
    },

    checkSharedDats: (dats) => {
      t.strictEqual(dats[userA.id].userAShare, sharedDat.key.toString('hex'), 'userB receives shared dat from userA')
      handlers.done()
    },

    done: () => {
      child.send({name: 'done'})
      pki.close(userA, err => { handleErr(err) })
      t.end()
    }
  }
})
