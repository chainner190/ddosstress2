// deobfuscate_safe.js
// Aman: hanya parse/transform AST, tidak mengevaluasi kode yang di-input-kan.

const fs = require('fs');
const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');

if (process.argv.length < 3) {
  console.error('Usage: node deobfuscate_safe.js <input.js>');
  process.exit(1);
}

const inputPath = process.argv[2];
const src = fs.readFileSync(inputPath, 'utf8');

// 1) Replace escaped unicode/hex sequences inside string literals with their actual characters
function unescapeStringLiteral(str) {
  // Convert common JS escapes safely (no eval)
  return str.replace(/\\x([0-9A-Fa-f]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
            .replace(/\\u\{([0-9A-Fa-f]+)\}/g, (m, h) => String.fromCodePoint(parseInt(h, 16)))
            .replace(/\\u([0-9A-Fa-f]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
            .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

// 2) Parse to AST (tolerant)
let ast;
try {
  ast = esprima.parseScript(src, { range: true, tolerant: true, comment: true, tokens: true });
} catch (e) {
  console.error('Parsing error:', e.message);
  process.exit(2);
}

// Attach comments/tokens for better codegen
escodegen.attachComments(ast, ast.comments, ast.tokens);

// 3) Gather identifiers and create mapping for short/garbled names
const idUsage = new Map();

estraverse.traverse(ast, {
  enter(node) {
    // collect variable/function parameter/FunctionDeclaration/Identifier usage in simple patterns
    if (node.type === 'Identifier') {
      const name = node.name;
      // skip commonly safe globals/builtins
      const skip = ['console','window','document','Math','JSON','require','module','exports','setTimeout','setInterval','clearTimeout','clearInterval'];
      if (!skip.includes(name)) {
        idUsage.set(name, (idUsage.get(name) || 0) + 1);
      }
    }
    // normalize string literals
    if (node.type === 'Literal' && typeof node.value === 'string' && node.raw && node.raw.includes('\\')) {
      node.value = unescapeStringLiteral(node.raw.slice(1, -1));
      node.raw = JSON.stringify(node.value);
    }
  }
});

// 4) Build a predictable mapping: more frequent identifiers keep simpler readable names
const byFreq = Array.from(idUsage.entries()).sort((a,b) => b[1]-a[1]);
const mapping = new Map();
let idx = 0;
for (const [name] of byFreq) {
  // Only rename suspicious short/gibberish names or names with hex-like names, but we keep original if already descriptive
  const shouldRename = name.length <= 3 || /^[\$_]?[0-9a-f]{3,}$/i.test(name) || /_0x[0-9a-f]+/i.test(name);
  if (shouldRename) {
    mapping.set(name, `v_${idx++}`);
  }
}

// 5) Apply mapping (rename identifiers in AST where safe)
estraverse.replace(ast, {
  enter(node, parent) {
    // rename Identifier nodes where appropriate and not property keys
    if (node.type === 'Identifier') {
      const old = node.name;
      if (mapping.has(old)) {
        // avoid renaming property keys of MemberExpression when not computed: obj.foo -> keep 'foo'
        if (parent && ((parent.type === 'MemberExpression' && parent.property === node && !parent.computed) ||
                       (parent.type === 'Property' && parent.key === node && !parent.computed) ||
                       (parent.type === 'MethodDefinition' && parent.key === node && !parent.computed))) {
          return node;
        }
        node.name = mapping.get(old);
        return node;
      }
    }
    // Replace string literal escape nodes already handled above
    return node;
  }
});

// 6) Generate formatted code with comments preserved
const generated = escodegen.generate(ast, {
  comment: true,
  format: {
    indent: { style: '  ' },
    newline: '\n',
    space: ' ',
    quotes: 'auto'
  }
});

console.log(generated);
