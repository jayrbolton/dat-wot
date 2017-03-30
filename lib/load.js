const fs = require('fs')
const flyd = require('flyd')
const R = require('ramda')
const openpgp = require("openpgp")
const Dat = require("dat-node")
const sqlite3 = require('sqlite3').verbose()

// Load an existing metadat user
function load(path, userID) {
}

module.exports = load
