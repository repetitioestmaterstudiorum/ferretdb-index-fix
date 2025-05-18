Package.describe({
  name: 'meteorisgreat:ferretdb-index-fix',
  version: '0.1.2',
  summary: 'Compatibility layer for Meteor ↔ FerretDB: drops sparse and unique index options.',
  git: 'https://github.com/tannerlab/meteorjs-ferretdb-index-fix',
  documentation: 'README.md',
});

Package.onUse((api) => {
  api.versionsFrom("3.2.2"); // Meteor version
  api.use(["ecmascript", "mongo"], "server"); // Server only, use ecmascript and mongo
  api.mainModule("index.js", "server"); // Load the package logic
});
