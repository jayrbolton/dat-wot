# dat public key infrastucture

> *Note:* This project is still very much an experimental work in progress. The examples below arent reliable.

Create decentralized user accounts with contacts, groups, private file sharing, encrypted messaging, and more.

_what it does_
- create your own user and group identities which can span multiple devices
- privately share specific dats with specific people and groups over p2p using cryptography
- send messages with certain contacts over dat
- publicly share dats

[_how it works_](https://github.com/jayrbolton/dat-pki/wiki/How-it-Works)

# api

## setup(options, callback)

Create a new user. The `options` object can have these properties:
* path: path you want to use to save your data (eg `~/.dat`)
* name: name to use for this user
* pass: passphrase for generating keypair

`callback` receives arguments for `callback(err, user)`, where `user` is an object with these properties:
* name
* path
* pubKey
* privKey
* id: a unique id that identifies this user across devices in the network (public)
* publicDat: a dat object for the user's public dat
* link: dat link of the users public dat that others can use to add them as a contact

The `publicDat` will be opened and joined on the network, so you'll want to manually `user.publicDat.close()` when you're done

```js
const {setup} = require('dat-pki')

setup({
  path: '~/.dat'
, name: 'bob ross'
, passphrase: '123 abc'
}, (err, user) => {
  // do stuff with the user
})
```

## load(path, passphrase, callback)

This will load an existing user from a directory with a passphrase, and unencrypt their stuff.

The callback takes `callback(err, user)`. The user object in the second argument to this callback is the exact same object as the one from `setup`

```js
const {load} = require('dat-pki')

load('~/.dat', '123 abc', (err, user) => {
  // do stuff with the user
})
```

## createDat(user, datName, callback)

Initialize a new dat for a user. The callback receives `callback(err, dat)` where `dat` is the dat object. The new dat has not joined the network or imported files, so you'll want to call `dat.joinNetwork()`, `dat.importFiles()`, and anything else you want. The `datName` needs to be unique for this user.

Also see makeDatPublic and shareDat.

## makeDatPublic(user, datName, callback)

Make a dat fully public, so users that follow you can download its files. The callback receives `callback(err, dat)` where `dat` is the dat object

## makeDatPrivate(user, datName, callback)

Remove a dat link from your public dat, so others cannot automatically see the dat. Changes the dat key.

## shareDat(user, datName, accessIDs, callback)

Share a dat with one or more contacts and/or groups by their ids. callback gets `callback(err, dat)`

## unshareDat(user, datName, accessIds, callback)

Unshare a dat from certain contacts/groups. Changes the dat link.

## follow(userA, userBLink, callback)

Follow another user, which allows userA to read any public data from userB, such as their public dat links.

The callback receives `callback(err, userB)`, where `userB` is an object with these properties:
- id
- name
- pubKey
- path
- link

## handshake(userA, userBLink, callback)

To create a 1:1 private data channel with another user, they both perform a handshake process. If the handshake succeeds, the two users are now "contacts" and can send private data to each other, including links to private dats.

This will create another dat, called the "relationship dat". That dat's address will get encrypted using userB's pubkey and placed in userA's public handshakes directory for userB to check using `checkHandshake`.

If both userA and userB successfully handshake with each other, the contact is created. Both users will have separate "relationship dats" for pushing data to the other user.

Also see checkHandshake

The callback receives `callback(err, userB, relDat)`. The third arg, `relDat`, is a dat object for the relationship dat. It is opened automatically

## checkHandshake(userA, userB, cb)

`userA` wants to check the status of a handshake that `userB` initiated. If `userB` has a handshake file in their public dat, then `userA` can decrypt it and start downloading from the relationship dat.

The callback receives `callback(err, userB, relFromDat)`. If the check fails, then err will be non-null. The third arg, `relFromDat`, is the dat that userA has created to download updates from userA. It is opened automatically.

## createGroup(user, groupName, callback)

Create a group identified by a name. The callback receives `callback(err, groupID)`. 

## addUsersToGroup(user, groupID, [userIDs], callback)

Add one or more users in your contacts to a group. The users must all be contacts with relationships established using handshake and checkHandshake.

## removeUsersFromGroup(user, groupID, [userIDs], callback)

Remove one or more users from a group

