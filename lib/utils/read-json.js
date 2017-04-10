

module.exports = {
  read: path => JSON.parse(fs.readFileSync(path))
, write: (obj, path) => fs.writeFileSync(path, JSON.stringify(obj))
}
