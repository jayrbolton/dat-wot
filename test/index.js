const fs = require('fs')
const assert = require('assert')
const {setup, load} = require('../')

setup({path: '/tmp/x', name: 'jay', email: 'arst@example.com', passphrase: 'arstarst'})
assert(fs.existsSync('/tmp/x'))

// process.exit()
