# meteorisgreat:ferretdb-index-fix

This packages provides compatibility for Meteor.js and FerretDB when used together with accounts-password.

## What it does

**Sequential index creation** – Wraps `Mongo.Collection.prototype.createIndexAsync` in a promise queue so every index is built one at a time.
This avoids the `deadlock detected` error that FerretDB/PostgreSQL can raise when multiple concurrent `CREATE INDEX` statements are issued by Meteor packages (e.g. accounts-base and accounts-password).

Once FerretDB/PostgreSQL gain robust concurrent‑index support, this package will no longer be useful.

## Installation

```sh
meteor add meteorisgreat:ferretdb-index-fix
```

Ensure it appears before the accounts packages in `.meteor/packages` so the wrapper is in place first.

## Background

Why does FerretDB deadlock when used with Meteor.js together with accounts-password?

### Meteor’s accounts packages run in parallel

| Package            | Indexes it tries to create (all `sparse + unique` unless noted) |
|--------------------|------------------------------------------------------------------|
| **accounts-base**  | `username`, `emails.address`, `services.resume.loginTokens.hashedToken`, `services.resume.loginTokens.token`,<br>`services.resume.haveLoginTokensToDelete` (*sparse only*), `services.resume.loginTokens.when` (*sparse only*),<br>`services.password.reset.when` (*sparse only*), `services.password.enroll.when` (*sparse only*) |
| **accounts-password** | `services.email.verificationTokens.token`, `services.password.reset.token`, `services.password.enroll.token` |

When Meteor starts up, the sequential `createIndexAsync` calls in https://github.com/meteor/meteor/blob/devel/packages/accounts-base/accounts_server.js and https://github.com/meteor/meteor/blob/devel/packages/accounts-password/password_server.js run in parallel, which leads to concurrent `CREATE INDEX` in PostgreSQL, which leads to a deadlock error. 

Note: the accounts packages each actually call `createIndexAsync` sequentially, but because the two packages run at the same time, we still end up with concurrent `createIndexAsync` calls. Also: just using accounts-base will work, but using accounts-password, which relies on accounts-base, will lead to this concurrent index creation on the same table.

This leads to the error `MongoServerError: deadlock detected`. Meteor re-throws that error as  
`[An error occurred when creating an index for collection "users"]`,  
and startup aborts.

### How this package fixes it

`meteorisgreat:ferretdb-index-fix` patches
`Mongo.Collection.prototype.createIndexAsync` so the calls form a promise queue.

Index definitions are not altered; they are simply run sequentially, which Postgres can handle without deadlocking.
