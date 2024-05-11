const fs = require('fs');
const path = require('path');

function extractComponentName(filePath) {
  // Extracts the component name from the filePath
  const parts = filePath.split('/');
  return parts[parts.length - 1];
}

function findPropDrilling(node, parentProps = {}, path = []) {
  let drillingResults = [];
  const currentProps = { ...node.props };

  // If parentProps has 'filePath', use it to extract the parent's name
  const parentName = parentProps.filePath
    ? extractComponentName(parentProps.filePath)
    : '';
  const newPath = parentProps.hasOwnProperty('filePath')
    ? [...path, parentName]
    : [...path];

  node.children.forEach((child) => {
    const childProps = child.props || {};
    Object.keys(childProps).forEach((key) => {
      // Check if prop is being drilled from the current parent
      if (parentProps.props && parentProps.props[key] === childProps[key]) {
        // Prop drilling is occurring, record from the current parent
        const drillPath = parentProps.hasOwnProperty('filePath')
          ? newPath
          : [node.name, child.name];
        drillingResults.push({
          drill: drillPath,
          props: [key],
        });
      } else if (currentProps[key] === childProps[key]) {
        // Prop drilling starts from the current node
        drillingResults.push({
          drill: [node.name, child.name],
          props: [key],
        });
      }
    });
    // Recursive call with current node as the new parent
    const resultsFromChild = findPropDrilling(
      child,
      { filePath: child.filePath, name: node.name, props: currentProps },
      newPath,
    );
    drillingResults = [...drillingResults, ...resultsFromChild];
  });

  return drillingResults;
}

function generateSummary(drillingAnalysis) {
  const summaries = Object.values(drillingAnalysis).reduce((acc, item) => {
    const entry = {
      [item.drill[0]]: {
        props: item.props,
        drillDistance: item.drill.length,
      },
    };
    return [...acc, entry];
  }, []);

  // Sort the array by drillDistance in descending order
  summaries.sort((a, b) => {
    const aDist = Object.values(a)[0].drillDistance;
    const bDist = Object.values(b)[0].drillDistance;
    return bDist - aDist;
  });

  return summaries;
}

// Main function to process the component tree from a file and output the analysis and summary
function processComponentTree(filePath) {
  try {
    const componentTree = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const drillingAnalysis = findPropDrilling(componentTree);
    const summary = generateSummary(drillingAnalysis);

    console.log(
      'Drilling Analysis:\n',
      JSON.stringify({ drilling: drillingAnalysis }, null, 2),
    );
    console.log('\nSummary of Drilling Analysis:\n', JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error('Error processing the component tree:', error);
  }
}

// Read filename from command line argument
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.log('Usage: node script.js <path-to-component-tree-file>');
  process.exit(1);
}

processComponentTree(path.resolve(args[0]));
