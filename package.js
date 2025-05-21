Package.describe({
  name: 'meteorisgreat:ferretdb-index-fix',
  version: '0.2.1',
  summary: 'Compatibility layer for Meteor\'s accounts packages and FerretDB: makes createIndexAsync sequential.',
  git: 'https://github.com/tannerlab/meteorjs-ferretdb-index-fix',
  documentation: 'README.md',
});

Package.onUse((api) => {
  api.versionsFrom("3.0");
  api.use(["ecmascript", "mongo"], "server"); // Server only, use ecmascript and mongo
  api.mainModule("index.js", "server"); // Load the package logic
});
