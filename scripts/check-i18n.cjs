const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const localesDir = path.join(root, 'src', 'locales');
const allowedLocales = ['en-US', 'zh-CN'];
const namespaces = [
  'component',
  'form',
  'globalHeader',
  'menu',
  'pages',
  'pwa',
  'settingDrawer',
  'settings',
];

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

function main() {
  const entries = listLocaleEntries();
  const allowedEntries = new Set([
    ...allowedLocales,
    ...allowedLocales.map((locale) => `${locale}.ts`),
  ]);
  const unexpected = entries.filter((entry) => !allowedEntries.has(entry));
  const missing = [...allowedEntries].filter((entry) => !entries.includes(entry));

  const keyProblems = [compareRootKeys(), ...namespaces.map(compareNamespaceKeys)]
    .filter(({ missingInEn, missingInZh }) => missingInEn.length || missingInZh.length);

  if (!unexpected.length && !missing.length && !keyProblems.length) {
    console.log('i18n check passed: zh-CN and en-US are the only supported locales and keys match.');
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

  process.exit(1);
}

main();
