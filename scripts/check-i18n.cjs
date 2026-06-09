const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const localesDir = path.join(root, 'src', 'locales');
const allowedLocales = ['en-US', 'zh-CN'];
const namespaces = [
  'component',
  'common',
  'form',
  'globalHeader',
  'menu',
  'pages',
  'pwa',
  'settingDrawer',
  'settings',
];
const sourceDirs = ['src'];
const ignoredSourceDirs = new Set([
  '.umi',
  '.umi-production',
  '.umi-test',
  'locales',
  'services',
  'assets',
]);

function listLocaleEntries() {
  return fs
    .readdirSync(localesDir, { withFileTypes: true })
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'));
}

function loadLocaleObject(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  }).outputText;

  const module = { exports: {} };
  const localRequire = (request) => {
    if (!request.startsWith('.')) {
      return require(request);
    }

    const requestPath = path.resolve(path.dirname(filePath), request);
    const resolvedPath = fs.existsSync(requestPath) ? requestPath : `${requestPath}.ts`;
    return loadLocaleObject(resolvedPath);
  };
  const context = {
    exports: module.exports,
    module,
    require: localRequire,
  };
  vm.runInNewContext(output, context, { filename: filePath });
  return module.exports.default || context.exports.default || module.exports;
}

function compareLocaleKeys(namespace, zhPath, enPath) {
  const zh = loadLocaleObject(zhPath);
  const en = loadLocaleObject(enPath);

  const zhKeys = Object.keys(zh).sort();
  const enKeys = Object.keys(en).sort();
  const missingInEn = zhKeys.filter((key) => !Object.prototype.hasOwnProperty.call(en, key));
  const missingInZh = enKeys.filter((key) => !Object.prototype.hasOwnProperty.call(zh, key));

  return { namespace, missingInEn, missingInZh };
}

function compareNamespaceKeys(namespace) {
  return compareLocaleKeys(
    namespace,
    path.join(localesDir, 'zh-CN', `${namespace}.ts`),
    path.join(localesDir, 'en-US', `${namespace}.ts`),
  );
}

function compareRootKeys() {
  return compareLocaleKeys(
    'root',
    path.join(localesDir, 'zh-CN.ts'),
    path.join(localesDir, 'en-US.ts'),
  );
}

function collectSourceFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredSourceDirs.has(entry.name)) {
        collectSourceFiles(entryPath, files);
      }
      continue;
    }

    if (/\.(j|t)sx?$/.test(entry.name) && !/\.(test|spec)\.(j|t)sx?$/.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

function extractUsedMessageIds(source) {
  const ids = new Set();
  const patterns = [
    /<FormattedMessage\b[^>]*\bid=["']([^"']+)["']/g,
    /formatMessage\(\s*\{\s*id:\s*["']([^"']+)["']/g,
    /formatGlobalMessage\(\s*["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) {
      ids.add(match[1]);
    }
  }
  return ids;
}

function collectUsedMessageIds() {
  const used = new Map();
  for (const sourceDir of sourceDirs) {
    const files = collectSourceFiles(path.join(root, sourceDir));
    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      for (const id of extractUsedMessageIds(source)) {
        if (!used.has(id)) {
          used.set(id, new Set());
        }
        used.get(id).add(path.relative(root, file));
      }
    }
  }
  return used;
}

function compareUsedMessageIds() {
  const zh = loadLocaleObject(path.join(localesDir, 'zh-CN.ts'));
  const en = loadLocaleObject(path.join(localesDir, 'en-US.ts'));
  const used = collectUsedMessageIds();
  const missing = [];

  for (const [id, files] of [...used.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const missingLocales = [];
    if (!Object.prototype.hasOwnProperty.call(zh, id)) {
      missingLocales.push('zh-CN');
    }
    if (!Object.prototype.hasOwnProperty.call(en, id)) {
      missingLocales.push('en-US');
    }
    if (missingLocales.length) {
      missing.push({ id, files: [...files].sort(), missingLocales });
    }
  }
  return missing;
}

function main() {
  const entries = listLocaleEntries();
  const allowedEntries = new Set([
    ...allowedLocales,
    ...allowedLocales.map((locale) => `${locale}.ts`),
  ]);
  const unexpected = entries.filter((entry) => !allowedEntries.has(entry));
  const missing = [...allowedEntries].filter((entry) => !entries.includes(entry));

  const keyProblems = [compareRootKeys(), ...namespaces.map(compareNamespaceKeys)].filter(
    ({ missingInEn, missingInZh }) => missingInEn.length || missingInZh.length,
  );
  const missingUsedIds = compareUsedMessageIds();

  if (!unexpected.length && !missing.length && !keyProblems.length && !missingUsedIds.length) {
    console.log(
      'i18n check passed: zh-CN and en-US are the only supported locales, keys match, and used message ids exist.',
    );
    return;
  }

  if (unexpected.length) {
    console.error(`Unexpected locale files/directories: ${unexpected.join(', ')}`);
  }
  if (missing.length) {
    console.error(`Missing required locale files/directories: ${missing.join(', ')}`);
  }
  for (const problem of keyProblems) {
    if (problem.missingInEn.length) {
      console.error(`[${problem.namespace}] Missing in en-US: ${problem.missingInEn.join(', ')}`);
    }
    if (problem.missingInZh.length) {
      console.error(`[${problem.namespace}] Missing in zh-CN: ${problem.missingInZh.join(', ')}`);
    }
  }
  for (const problem of missingUsedIds) {
    console.error(
      `[used-id] ${problem.id} missing in ${problem.missingLocales.join(', ')}; used by ${problem.files.join(', ')}`,
    );
  }

  process.exit(1);
}

main();
