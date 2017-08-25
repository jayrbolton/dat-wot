// const fork = require('child_process').fork
const fs = require('fs-extra')

const path = './test/tmp'
fs.ensureDir(path)

require('./setup')
require('./load')
require('./createPublicDat')
require('./follow')
require('./handshake')
require('./createDat')
