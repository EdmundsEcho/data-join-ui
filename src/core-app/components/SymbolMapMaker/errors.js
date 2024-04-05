/**
 * SymbolMapMaker error messages
 * see constants/error-messages.js to see other error messages
 */
const ERRORS = {
  doesNotExist: (leftValue) => ({
    key: 'doesNotExist',
    message: `The field value, > ${leftValue} <, does not exist.`,
    fix: 'Select a valid field value; use the preview.',
    doc: 'Any values not included will remain unchanged; only specify what values need to be scrubed.',
  }),
  missingScrubValue: (leftValue) => ({
    key: 'missingScrubValue',
    message: `Missing the new scrubed version of > ${leftValue} <.`,
    fix: 'Set the scrub value to an edited version of the original value.',
    doc: 'Any values not included will remain unchanged; only specify what values need to be scrubed.',
  }),
  matching: () => ({
    key: 'matching',
    message: 'The new scrub value matches the original value.',
    fix: 'Set the scrub value to an edited version of the original value.',
    doc: 'Any values not included will remain unchanged; only specify what values need to be scrubed.',
  }),
};

export default ERRORS;
