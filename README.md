meteorisgreat:ferretdb-index-fix
==================

**What it does**

- Removes `sparse` & `unique` from index specs that Meteor’s accounts packages create, because FerretDB (≤ v2.2) still lacks sparse/partial index support.
- Runs every `createIndexAsync` sequentially to avoid Postgres 40P01 “deadlock detected”.
- Swallows only 2 benign errors (`deadlock detected`, code 86 `IndexKeySpecsConflict`).


**How to use**

In Meteor, run the following: 
```sh
meteor add meteorisgreat:ferretdb-index-fix
```

List it *before* `accounts-password` in `.meteor/packages` if you edit that file manually.

Remove the package once FerretDB closes issue [#2448](https://github.com/FerretDB/FerretDB/issues/2448) and supports sparse / partial indexes natively.
