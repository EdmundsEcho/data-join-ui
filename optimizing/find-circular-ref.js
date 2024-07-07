const fs = require('fs');
const path = require('path');

function isCyclic(obj) {
  const seenObjects = new WeakSet();

  function detect(obj) {
    if (obj && typeof obj === 'object') {
      if (seenObjects.has(obj)) {
        return true;
      }
      seenObjects.add(obj);

      return Object.entries(obj).some(([key, value]) => detect(value));
    }
    return false;
  }

  return detect(obj);
}

// Read filename from command line argument
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.log('Usage: node detectCircularReferences.js <path-to-redux-store-file>');
  process.exit(1);
}

const filePath = path.resolve(args[0]);

// Read the Redux store JSON file
try {
  const reduxStore = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Check for circular references
  if (isCyclic(reduxStore)) {
    console.error('Redux store contains circular references');
  } else {
    console.log('Redux store does not contain circular references');
  }
} catch (error) {
  console.error('Error reading or parsing file:', error.message);
}

// END
