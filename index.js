module.exports = {
  setup: require('./lib/setup'),
  load: require('./lib/load'),
  follow: require('./lib/follow'),
  makeDatPublic: require('./lib/makeDatPublic'),
  createDat: require('./lib/createDat'),
  handshake: require('./lib/handshake'),
  checkHandshake: require('./lib/checkHandshake'),
  shareDat: require('./lib/shareDat'),
  getPublicDats: require('./lib/getPublicDats'),
  getSharedDats: require('./lib/getSharedDats'),
  close: require('./lib/close')
}
