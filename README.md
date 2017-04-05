# dat + pgp for encrypted, p2p user interaction and data sharing

This integrates dat with Open PGP to allow for a 100% p2p and encrypted data sharing system and user-level controls, like controlling who can see what directories. This is intented to be a node API on which we will build a file-sharing UI with user interaction.

_what it does_
- publicly share directories on your device
- privately share directories and control permissions with other people and groups
- privately send messages

# api

## setup(options, cb)

Create a new metadat user. The `options` takes these parameters:
* path: path you want to use to save your data
* name: name to use for this device/user
* passphrase: passphrase for generating pgp keys

`setup` takes an optional callback, which receives the device's public metadat address as the first argument, and the pgp key object as the second argument.

```js
const metadat = require('metadat')

metadat.setup({
  path: '~/.metadat'
, name: 'bob ross'
, passphrase: '123abc'
}, function(user) {
  // user is an object with pgp keys, dat keys, and contact array
})
```

## load(path, passphrase)

This will load an existing metadat root directory and unencrypt things using the given passphrase.

```js
metadat.loadUser('~/.metadat', '123abc', function(user) {
  // the user object is provided, needed for many functions below
  user.publicKeyArmored // pgp public key
  user.publicMetadat // key of the user's public metadat
  user.publicDats // array of public dat addresses
  user.privateDats // array of non-public dat addresses for this metadat
  user.relationships // array of user objects
  user.relationships[0] // user object of contact.. {name: 'Bob Ross', pubKey: 'xyz', metadat: 'xyz', etc}
  user.follows // array of user objects
  user.follows[0] // user object
})
```

## loadDats(userA, userB, cb)

Load an array of shared dats from another user

```js
metadat.loadDats(userA, userB, function(dats) {
  // dats is an array of dat objects that userB has shared with userA
})
```

## share(userA, datKey, userB, cb)

Share a regular dat with a contact. It will find the relationship metadat for this contact and add the given dat key into the list of shared dats.

```js
// User with key userA shares dat with key 'datKey' with contact  userB
metadat.share(userA, 'datKey', userB, function() {
  // Share is complete
})
```

## groupShare(userA, datKey, groupName, cb)

Share a dat with a group

```js
metadat.shareGroup(userA, 'datKey', 'groupName', function() {
  // Share is complete
})
```

## unshare(userKey, datKey, contactKey, cb)

Removes a dat key from a relationship metadat and generates a new dat key, so the contact can no longer read any updates (but will likely still have a copy on their own device).

```js
// User userA unshares dat 'datKey' with contact userB
metadat.unshare(userA, 'datKey', userB, function() {
  // Unshare is complete
})
```

## follow

Follow another user's public metadat

```js
metadat.follow(userA, userB, function(dats) {
  // dats is an array of public dats from userB
})
```

## createRelationship(userA, userB, cb)

Create a relationship metadat between two users. This creates a new dat for the relationship metadat, encrypts the key using `userB`'s pubkey, and places it in the first user's public metadat for the second user to read.

The callback is called when the relationship handshake is initiated and the encrypted relationship metadat key has been created.

```js
metadat.addContact(userA, userB, function(data) {
  data.key // relationship metadat key 
  data.keyArmored // pgp-encrypted metadat key
})
```

## addToGroup(userA, groupName, userB, cb) 

Add a contact to a group.

```js
metadat.addToGroup(userA, 'groupName', userB, function() {
  // Add to group is complete
})
```

## create(userA, path, cb)

Create a new dat, private by default. Pass in the user object and a path for the dat.

```js
metadat.create(userA, path, function(key) {
  // dat is created, dat key is now available
})
```

## publicize(userA, datKey, cb)

Make a dat public for userA. This will add it into the public listing in their public metadat.

```js
metadat.publicize(userA, 'datKey', function() {
  // dat is now public
})
```

## privatize(userA, datKey, cb)

Remove a dat key from your public listing and change the key.

```js
metadat.privatize(userA, 'datKey', function() {
  // dat is no longer public
})
```

## postMessage(userA, message, userB, cb)

Post a message from one user to another

```js
metadat.postMessage(userA, 'message content', userB, function() {
  // Message has been posted
})
```

## readMessages(userA, cb)

Read all messages for a user

```js
metadat.readMessages(userA, function(messages) {
  // messages is an array of message objects
})
```
