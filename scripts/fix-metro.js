const fs = require('fs');
const path = require('path');

const nodeModulesDir = path.join(__dirname, '..', 'node_modules');

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, baseDir));
    } else if (file.endsWith('.js')) {
      const rel = path.relative(baseDir, filePath).replace(/\\/g, '/');
      results.push(rel);
    }
  });
  return results;
}

const entries = fs.readdirSync(nodeModulesDir);

entries.forEach((entry) => {
  if (entry.startsWith('metro')) {
    const pkgPath = path.join(nodeModulesDir, entry, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        let mainFile = pkg.main || 'src/index.js';
        if (!mainFile.startsWith('./')) mainFile = './' + mainFile;

        const exportsMap = {
          ".": mainFile,
          "./package.json": "./package.json",
          "./private/*": "./src/*.js"
        };

        const srcDir = path.join(nodeModulesDir, entry, 'src');
        const jsFiles = getAllFiles(srcDir);

        jsFiles.forEach((file) => {
          const withExt = 'src/' + file;
          const noExt = withExt.replace(/\.js$/, '');
          exportsMap['./' + noExt] = './' + withExt;
          exportsMap['./' + withExt] = './' + withExt;
        });

        exportsMap['./*'] = './*';
        pkg.exports = exportsMap;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      } catch (err) {
        console.error(`Error updating ${entry}:`, err);
      }
    }
  }
});

console.log('Complete Metro case-exact exports map generated');
