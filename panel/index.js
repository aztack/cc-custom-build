const { read, readConfig, writeConfig, buildConfigFile } = require_('utils.js');
const $path = require('path');

const vm = (el) => {
  return new Vue({
    el,
    name: 'custom-build-panel',
    template: read('panel/panel.html'),
    data () {
      return {
        settingsSaved: false,
        hooks: {
          ['build-start']: '../bin/build-start.js',
          ['build-finish']: '../bin/build-finish.js'
        }
      }
    },
    created() {
      window.cccbuild = this;
    },
    compiled(){
      readConfig($path.resolve(Editor.url(`db://assets`), `../settings/${buildConfigFile}`)).then(config => {
        this.hooks = config;
        Editor.Ipc.sendToMain(`cc-custom-build:save`, [this.hooks]);
      });
    },
    methods: {
      $t(key) {
        return Editor.T('cc-custom-build.' + key);
      },
      saveSettings() {
        const self = this;
        this.settingsSaved = true;
        writeConfig($path.resolve(Editor.url(`db://assets`), `../settings/${buildConfigFile}`), this.hooks).then(() => {
          Editor.Ipc.sendToMain(`cc-custom-build:save`, [this.hooks]);
          setTimeout(() => {
            self.settingsSaved = false;
          }, 1000);
        });
      },
      onPropChange(e) {
        const key = e.target.dataset.key;
        this.hooks[key] = e.target.value;
      }
    }
  })
};

Editor.Panel.extend({
  style: read('panel/style.css'),
  template: read('panel/index.html'),
  $: {
    root: '#cc-custom-build-panel'
  },
  ready () {
    this.vm = vm(this.$root);
  }
});

function require_(relativePath) {
  return Editor.require(`packages://cc-custom-build/${relativePath}`);
}