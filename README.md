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

## On-disk data

My private data folder (not a dat)
  * Who I follow
  * My pgp private/public key
  
```
~/.metadat/contacts/contact1/  (dat)
~/.metadat/contacts/contact2/  (dat)
~/.metadat/.keys/ (pgp stuff)
```
  
My public data folder (dat)
  * My pgp public key
  * My list of dats (could be a simple json file to start but then evolve to be more secret later, e.g., cryptodb.)
    * some encrypted 
    * some not encrypted
      
```
~/.metadat/me/public.key
~/.metadat/me/dats.json
```

dats.json
```
{"key": {"public": true}}
```

How do I tell if one is encrypted for me or not? In this model I'd have to try to decrypt everything or look at the signature


## TODO

```
// Add my dat at the given path to the list of dats.
// Takes the address and adds it to the database
metadat.add(path, {public: true})

// Add a contact, saving their public key locally
metadat.addContact(userMetadatAddress)

// See a user's list of dats without adding them as a contact
metadat.listUsersDats(userMetadatAddress)

// See a list of my local dats
metadat.list()

// Encrypted version of the address gets saved. Users following me are able to unencrypt the dats they have access to. 
metadat.share(key, userMetadatAddress[es])
```

## Groups

PGP groups could be used to add multiple people to the same list of dats. 



```

