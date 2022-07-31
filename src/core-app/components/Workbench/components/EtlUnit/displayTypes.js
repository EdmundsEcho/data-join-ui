//
// Informs how to display leaf and group nodes
// ⬜ Unify/formalize
//
const types = {
  leaf: ['etlUnit', 'alias', 'none'],
  group: [
    'shell', // group in the palette
    'empty', // group with no assigned semantic
    'group', // group with no assigned semantic
    'subjectUniverse', // group of qualities
    'derivedField', // group of measurements
    'microPool', // TnC fodder for final match
    'naturalTransformation', // measurement -> quality
  ],
};

export default types;
