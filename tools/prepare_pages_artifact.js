// Copies the built site into an output folder for GitHub Pages (Actions deploy).
// Mirrors what Jekyll published before: everything except the `exclude` list in _config.yml,
// dot/underscore entries and the output folder itself. Also writes build-info.json so the
// admin can tell when a pushed commit is live.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');

const readExcludes = () => {
  const config = fs.readFileSync(path.join(root, '_config.yml'), 'utf8');
  const block = config.split(/^exclude:\s*$/m)[1] || '';
  return block.split('\n')
    .map((line) => line.match(/^\s+-\s+(.+?)\s*$/)?.[1])
    .filter(Boolean)
    .map((entry) => entry.replace(/^["']|["']$/g, '').replace(/\/$/, ''));
};

const currentCommit = () => {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};

const prepare = (outDir) => {
  const target = path.resolve(root, outDir);
  if (target === root || !target.startsWith(root + path.sep)) throw new Error(`Output must be a folder inside the repo: ${outDir}`);
  const outName = path.relative(root, target).split(path.sep)[0];
  const excludes = new Set([...readExcludes(), outName, 'node_modules']);
  const skip = (relative) => {
    const name = path.basename(relative);
    if (name.startsWith('.') || name.startsWith('_')) return true;
    return excludes.has(relative);
  };

  fs.rmSync(target, { recursive: true, force: true });
  let count = 0;
  const copyDir = (relativeDir) => {
    for (const entry of fs.readdirSync(path.join(root, relativeDir), { withFileTypes: true })) {
      const relative = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      if (skip(relative)) continue;
      if (entry.isDirectory()) copyDir(relative);
      else if (entry.isFile()) {
        const destination = path.join(target, ...relative.split('/'));
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(path.join(root, ...relative.split('/')), destination);
        count += 1;
      }
    }
  };
  copyDir('');
  fs.writeFileSync(path.join(target, 'build-info.json'), `${JSON.stringify({ commit: currentCommit(), builtAt: new Date().toISOString() })}\n`);
  return { target, count, excludes: [...excludes] };
};

if (require.main === module) {
  const result = prepare(process.argv[2] || '_site');
  console.log(`Prepared ${result.count} files in ${path.relative(root, result.target)}.`);
}

module.exports = { prepare, readExcludes };
