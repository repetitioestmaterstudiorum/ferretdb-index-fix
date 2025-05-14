Package.describe({
  name: 'meteorisgreat:ferretdb-index-fix',
  version: '0.1.1',
  summary: 'Work-around for FerretDB dead-lock & sparse-index issues in Meteor',
  git: 'https://github.com/repetitioestmaterstudiorum/ferretdb-index-fix.git',
  documentation: 'README.md',
});

Package.onUse((api) => {
  api.versionsFrom("3.2.2"); // Meteor version
  api.use(["ecmascript", "mongo"], "server"); // Server only, use ecmascript and mongo
  api.mainModule("index.js", "server"); // Load the package logic
});