/**
 * Queue-serialises Mongo.Collection.prototype.createIndexAsync.
 *
 * Every call is pushed onto a single Promise chain (`queue`), so index builds
 * run strictly one after another instead of in parallel. This prevents
 * deadlocks when using FerretDB and Meteor accounts-password.
 *
 * The package must placed in .meteor/packages before the accounts packages.
 * 
 * The behavior of createIndexAsync is otherwise unchanged.
 */

import { Mongo } from "meteor/mongo";

const origCreateIndexAsync = Mongo.Collection.prototype.createIndexAsync;

// Single shared chain
let queue = Promise.resolve();

Mongo.Collection.prototype.createIndexAsync = function (...args) {
  queue = queue.then(() =>
    origCreateIndexAsync.apply(this, args)
  );
  return queue;
};
