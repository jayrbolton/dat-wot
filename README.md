# dat + pgp for user interaction around data sharing

This integrates dat with open pgp and a metadata system to allow for encrypted messaging and dat discovery among dat users tied to pgp keypairs.

_what it does_
- dat-pgp creates and manages a `metadat` dat directory that stores your pubkey and all your metadata
- your pgp pubkey plus your metadat constitutes a kind of _"dat user profile"_
- the address of the `metadat` is the public ID of your "dat user"
- the metadat has a keyring of your pgp contacts, plus directories of your dats, plus permissions on those dats, plus readable names
- you can store any metadata in your metadat; for example, assigning readable names to your dats

_how it can be used_
- User Finn creates a PGP key pair and metadat directory on his device
- Finn shares his user ID with Jake, and Jake shares his ID back
- Finn and Jake can now share dats, files, and messages with each other using the dat protocol
- All connections are P2P, and any private data can be initially share using pgp encryption

Your data is not stored in your metadat, but your metadat will keep track of information about your data data. The metadat keeps track of things like your trusted contacts, other groups, publicly available dat addresses for other people, encrypted private dat addresses for specific people or groups, and can keep a keyring of other dat users' pgp pubkeys.

# api

## setup(path), load(path)

```js
const fs = require('fs')
const metadat = require('metadat')

// Initialize a new metadat with a new pgp key
metadata.setup('/my/new/directory/path')

// Load an existing metadat
metadata.load('/my/existing/directory/path')
```
