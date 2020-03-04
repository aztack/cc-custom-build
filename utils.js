const pkgName = 'cc-custom-build';
const $fs = require('fs');

function read(relativePath) {
  return $fs.readFileSync(Editor.url(`packages://${pkgName}/${relativePath}`), 'utf-8');
}

module.exports = {
  read,
  pkgName
}