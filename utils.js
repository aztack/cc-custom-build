const pkgName = 'cc-custom-build';
const $fs = require('fs');
const $path = require('path');
const buildConfigFile = 'cc-custom-build.json';

function read(relativePath) {
  return $fs.readFileSync(Editor.url(`packages://${pkgName}/${relativePath}`), 'utf-8');
}

function readConfig() {
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    let pkg;
    try {
      pkg = JSON.parse($fs.readFileSync($path.resolve(cwd, 'package.json')));
    } catch (e) {
      reject(e);
    }
    const configPath = $path.resolve(cwd, pkg.name, 'settings', buildConfigFile);
    if ($fs.existsSync(configPath)) {
      let config = {};
      try {
        config = JSON.parse($fs.readFileSync(configPath).toString());
        resolve(config);
      } catch (e) {
        reject(e);
      }
      
    } else {
      reject(new Error(`Did not find custom build config, please click apply button on custom build panel`));
    }
  });
}

function writeConfig(configPath, config) {
  return new Promise((resolve, reject) => {
    try {
      $fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
      resolve();
    } catch(e) {
      reject(e)
    }
  });
}

module.exports = {
  read,
  pkgName,
  buildConfigFile,
  readConfig,
  writeConfig
}