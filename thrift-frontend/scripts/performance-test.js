const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');

const getFileSize = (filePath) => {
  try {
    return fs.statSync(filePath).size;
  } catch (e) {
    return 0;
  }
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const analyzeBuild = () => {
  console.log('\n' + '='.repeat(60));
  console.log('PERFORMANCE ANALYSIS');
  console.log('='.repeat(60));

  const jsDir = path.join(buildDir, 'static', 'js');
  const cssDir = path.join(buildDir, 'static', 'css');

  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;

  if (fs.existsSync(jsDir)) {
    console.log('\nJavaScript Files:');
    fs.readdirSync(jsDir).forEach(file => {
      const size = getFileSize(path.join(jsDir, file));
      jsSize += size;
      totalSize += size;
      console.log(`  ${file}: ${formatBytes(size)}`);
    });
    console.log(`  Total JS: ${formatBytes(jsSize)}`);
  }

  if (fs.existsSync(cssDir)) {
    console.log('\nCSS Files:');
    fs.readdirSync(cssDir).forEach(file => {
      const size = getFileSize(path.join(cssDir, file));
      cssSize += size;
      totalSize += size;
      console.log(`  ${file}: ${formatBytes(size)}`);
    });
    console.log(`  Total CSS: ${formatBytes(cssSize)}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total: ${formatBytes(totalSize)}`);
  console.log(`JS: ${formatBytes(jsSize)} (${Math.round(jsSize/totalSize*100)}%)`);
  console.log(`CSS: ${formatBytes(cssSize)} (${Math.round(cssSize/totalSize*100)}%)`);

  const jsTarget = 500 * 1024;
  const cssTarget = 50 * 1024;

  console.log('\n' + '='.repeat(60));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(60));

  if (jsSize > jsTarget) {
    console.log(`[WARNING] JS (${formatBytes(jsSize)}) > target (${formatBytes(jsTarget)})`);
  } else {
    console.log(`[OK] JS bundle within target`);
  }

  if (cssSize > cssTarget) {
    console.log(`[WARNING] CSS (${formatBytes(cssSize)}) > target (${formatBytes(cssTarget)})`);
  } else {
    console.log(`[OK] CSS bundle within target`);
  }

  console.log('\n' + '='.repeat(60) + '\n');
};

if (fs.existsSync(buildDir)) {
  analyzeBuild();
} else {
  console.error('Build directory not found. Run "npm run build" first.');
  process.exit(1);
}
