
// Import all files into a dat with a callback that runs when all files have finished importing

module.exports = function importAll (dat, callback) {
  const progress = dat.importFiles({count: true})
  let totalBytes = 0, progressBytes = 0
  progress.once('count', data => totalBytes = data.bytes)
  progress.on('put-data', (chunk) => {
    progressBytes += chunk.length
    if (progressBytes === totalBytes) callback()
  })
}
