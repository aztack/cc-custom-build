// https://docs.cocos.com/creator/manual/zh/publish/custom-project-build-template.html
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
var $hooks = {}

function makeHook (name) {
  return function hook(options, callback) {
    const script = $hooks[name];
    try {
      if (script) {
        const root = path.resolve(Editor.url(`db://assets/`), '..');
        const fullpath = path.resolve(root, script);
        Editor.log(`Execute custom build script: ${fullpath}`);
        const fn = eval(fs.readFileSync(fullpath).toString());
        const result = fn(options);
        if (result && typeof result.then === 'function') {
          result.then(() => callback());
        }
      } else {
        Editor.error(`Can not find hook named ${name}`);
        callback();
      }
    } catch(e) {
      Editor.error(`Custom build failed: ${e.toString()}, ${e.message}`);
      callback();
    }
  }
}

const onBuildStart = makeHook('build-start', $hooks);
const onBuildFinish = makeHook('build-finish', $hooks);

module.exports = {
  load() {
    Editor.log(`Loading Package "cc-custom-build" from ${__dirname}`);
    Editor.Builder.on('build-start', onBuildStart);
    Editor.Builder.on('build-finished', onBuildFinish);
    if(process.argv.indexOf('--build') > 0) {
      Editor.log(`Building from command line`)
      Editor.log(`Loading custom build config`);
      utils.readConfig().then((config) => {
        $hooks = config;
        Editor.log(`Custom build config: ${JSON.stringify(config)}`);
      }).catch((e) => {
        Editor.error(`Did not find custom build config, please click apply button on custom build panel`, e);
      });
    }
  },
  unload() {
    Editor.log('Unloading Package "cc-custom-build"');
    Editor.Builder.removeListener('build-start', onBuildStart);
    Editor.Builder.removeListener('build-finished', onBuildFinish);
  },
  messages: {
    ['cc-custom-build:save'](e, args) {
      $hooks = args[0];
      Editor.log($hooks);
    }
  }
};