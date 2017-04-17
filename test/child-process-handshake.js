const json = require('../lib/utils/json')
const {setup, handshake, checkHandshake} = require('../')

const prefix = '/tmp/metadat-test'

const handlers = {
  // Parent process has initialized user and sends key to us to make a handshake
  startHandshake: (user, key) => {
    handshake(user, key, 'arstarst', (dat, user, otherUser) => {
      process.send({name: 'handshakeComplete', data: user.id})
    })
  }
, checkHandshake: (user, otherUserID) => {
    const otherUser = json.read(user.dirs.follows + '/' + otherUserID + '/user.json')
    checkHandshake(user, otherUser)
  }
}

setup({path: prefix + '/handshake-test-child', name: 'u2', passphrase: 'arstarst', numBits: 512}, (user) => {
  user.publicMetadat.importFiles({watch: true})
  user.publicMetadat.joinNetwork()
  process.send({name: 'startHandshake', data: user.publicMetadat.key.toString('hex')})

  process.on('message', (msg) => {
    const {name, data} = msg
    handlers[name](user, data)
  })
})
