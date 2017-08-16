
// Import all files into a dat with a callback that runs when all files have finished importing

module.exports = function importAll (dat, callback) {
  const progress = dat.importFiles({count: true})
  let totalBytes = 0
  let progressBytes = 0
  progress.once('count', data => { 
    totalBytes = data.bytes
    if (totalBytes === 0) callback(null)
    console.log({data})
  })
  progress.on('put-data', (chunk) => {
    progressBytes += chunk.length
    if (progressBytes === totalBytes) callback(null)
  })
}
