// FerretDB work-around: ignore any index that asks for `sparse:true` - remove sparse and unique
// Otherwise build the index – but one at a time – and catch and log harmless errors.
// Still an issue in FerretDB 2.2: https://github.com/FerretDB/FerretDB/issues/2448

import { Mongo, MongoInternals } from "meteor/mongo";

const isBenign = (e) =>
  /deadlock detected/i.test(e?.message || "") || e?.code === 86;

function patchOpts(opts) {
  if (opts && typeof opts === "object" && opts.sparse) {
    const { sparse, unique, ...rest } = opts; // Remove sparse nad unique flags
    return rest;
  }
  return opts;
}

// Wrap Mongo.Collection
(() => {
  const collectionProto = Mongo.Collection.prototype;

  /* sync */
  const syncCreateIndex = collectionProto.createIndex;
  collectionProto.createIndex = function (keys, opts, cb) {
    try {
      return syncCreateIndex.call(this, keys, patchOpts(opts), cb);
    } catch (e) {
      console.warn(
        "Benign error in Mongo.Collection.createIndex (FerretDB workaround)",
        e,
      );
      throw e;
    }
  };

  /* async (serialised) */
  const asyncCreateIndex = collectionProto.createIndexAsync;
  let indexChain = Promise.resolve();
  collectionProto.createIndexAsync = function (keys, opts) {
    indexChain = indexChain.then(() =>
      asyncCreateIndex.call(this, keys, patchOpts(opts)).catch((e) => {
        console.warn(
          "Benign error in Mongo.Collection.createIndexAsync (FerretDB workaround)",
          e,
        );
        throw e;
      }),
    );
    return indexChain;
  };
})();

// Wrap MongoConnection if present
(() => {
  const connectionProto =
    MongoInternals?.MongoConnection?.prototype ||
    global.Meteor?.MongoConnection?.prototype;
  if (!connectionProto) return;

  const connectionCreateIndexAsync = connectionProto.createIndexAsync;
  if (typeof connectionCreateIndexAsync !== "function") return;

  let connectionChain = Promise.resolve();
  connectionProto.createIndexAsync = function (coll, keys, opts) {
    connectionChain = connectionChain.then(() =>
      connectionCreateIndexAsync
        .call(this, coll, keys, patchOpts(opts))
        .catch((e) => {
          if (isBenign(e)) {
            console.warn(
              "Benign error in MongoConnection.createIndexAsync (FerretDB workaround)",
              e,
            );
            return;
          }
          throw e;
        }),
    );
    return connectionChain;
  };
})();
