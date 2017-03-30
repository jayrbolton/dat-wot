
# dat + pgp

This integrates dat with open pgp and a metadata system to allow for encrypted messaging and dat discovery among dat users tied to pgp pubkeys. This lib wraps dat-node and uses a functional, non-OO interface.

_what it does_
- dat-pgp creates and manages a `metadat` dat directory that stores your pubkey and all your metadata
- your pgp pubkey plus your metadat constitutes a kind of _"dat user profile"_
- the address of the `metadat` is the public ID of your "dat user"
- the metadat has a keyring of your pgp contacts, plus directories of your dats, plus permissions on those dats, plus readable names
- you can store any metadata in your metadat; for example, assigning readable names to your dats

_how it can be used_
- User Finn creates a PGP key pair and metadat directory on his device
- Finn shares his user ID with Jake, and Jake shares his ID back
- Finn and Jake can now share dats, files, and messages with each other using dat
- All connections are P2P, and any data can be encrypted and shared

Your contacts' metadats are stored 

Your data is not stored in your metadat, but your metadat will keep track of where you have it.

# api

## initialize()

Initialize it with your metadat folder

```js
import initialize from 'pgp-dat'
const api = initialize('~/.metadat')
```

## api.user

This is an object containing data about your current user

```js
api.user // -> {name: 'finn', addr: 'xyz', path: }
```

## api.addDat(name, path)

Create a dat in a directory with a readable name. Returns an object with data about that dat/

```js
const dat1 = api.addDat('myDat1', '~/dats/myDat1')
```

## api.listDats(user)

List the available dat names for a given user.

```js
api.listDats(api.user) // -> ['myDat1']
```

## api.listAllDats()

List all available dats on yourself, plus all contacts.

## api.removeDat(name)

## api.addContact(datAddr)

## api.shareDat(name, contact)

## api.makePublic(name)

## api.downloadDat(user, name)

Download a dat from a user

## api.sendMessage(user, message)

Send a message to a user

## api.readInbox()

Read your messages; returns an array of message objects. Your messages stored in SQLite.

