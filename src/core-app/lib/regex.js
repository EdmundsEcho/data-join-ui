// src/lib/regex.js

/**
 * @module lib/regex
 * @description
 * Support for formatting data
 */
import { InputWarning } from './LuciWarnings';

/* eslint-disable no-console */

// units of expressions
// user parser -> regex token
const parserDic = (key) => {
  const dic = {
    YYYY: '([1-2][0-9]{3})',
    YY: '([0-9]{2})',
    MM: '([1][0-2]|[0]?[1-9])',
    a: '([a-zA-Z])',
    'a*': '([a-zA-Z]+).*',
    '*a': '\\d+.?\\d+([a-z]+)',
    'aaa*': '([a-zA-Z]{3}).*',
    '*aaa': '.*([a-zA-Z]{3})$',
    ignore: '\\D*',
  };
  return dic[key] || key;
};

/**
 *
 * 🚧 mspan output considerations:
 *
 *     👉 include an iso-compliant format
 *
 *     👉 format to comply with string sorting = date/time sequence
 *
 * @constant
 */
const configDic = {
  'YYYY-MM': {
    key: 'YYYY-MM',
    parsers: ['ignore', 'YYYY', '-', 'MM', 'ignore'],
    output: '$1-$2',
    type: 'mspan',
  },
  YYYY_MM: {
    key: 'YYYY_MM',
    parsers: ['ignore', 'YYYY', '_', 'MM', 'ignore'],
    output: '$1-$2',
    format: 'YYYY-MM',
    type: 'mspan',
  },
  MM_YYYY: {
    key: 'MM_YYYY',
    parsers: ['ignore', 'MM', '_', 'YYYY', 'ignore'],
    output: '$1-$2',
    format: 'YYYY-MM',
    type: 'mspan',
  },
  'MM-YYYY': {
    key: 'MM-YYYY',
    parsers: ['ignore', 'MM', '-', 'YYYY', 'ignore'],
    output: '$1-$2',
    format: 'YYYY-MM',
    type: 'mspan',
  },
  MMYYYY: {
    key: 'MMYYYY',
    parsers: ['ignore', 'MM', 'YYYY', 'ignore'],
    output: '$1-$2',
    format: 'YYYY-MM',
    type: 'mspan',
  },
  YYYYMM: {
    key: 'YYYYMM',
    parsers: ['ignore', 'YYYY', 'MM', 'ignore'],
    output: '$1-$2',
    format: 'YYYY-MM',
    type: 'mspan',
  },
  'a*': {
    key: 'a*',
    parsers: ['a*'],
    output: '$1',
    type: 'mcomp',
  },
  '*a': {
    key: '*a',
    parsers: ['*a'],
    output: '$1',
    type: 'mcomp',
  },
  '*aaa': {
    key: '*aaa',
    parsers: ['*aaa'],
    output: (match, $1) => $1.toUpperCase(),
    type: 'mcomp',
  },
  'aaa*': {
    key: 'aaa*',
    parsers: ['aaa*'],
    output: '$1'.toUpperCase(),
    type: 'mcomp',
  },
};

/**
 * select a configuration by lookup tag
 * (a list of tags provided using regexTags)
 *
 * user input -> { parser, output }
 * @function
 * @param {string} lookup
 * @return {{parsers: Array.<string>, output: string}}
 * @throws InputWarning
 *
 * ⬜ Figure out the best way to organize/type the expressionDic
 *
 */
export function selectConfig(lookup) {
  try {
    if (configDic[lookup]) return configDic[lookup];
    throw new InputWarning(
      `Failed to return a regex configuration for: ${lookup}`,
    );
  } catch (e) {
    console.error(e.message);
    return { parsers: ['*'], output: '$1' };
  }
}

/**
 *
 * Public access to the available regex expressions.
 *
 *     { type: [regex tag] }
 *
 * @function
 * @param void
 * @return {Object.<string,Array.<string>>}
 *
 */
export const regexTags = (() => {
  const types = [
    ...new Set(Object.values(configDic).map((entry) => entry.type)),
  ];
  const regexTagsByType = types.reduce((typeObj, type) => {
    // type: [regex key]
    /* eslint-disable-next-line no-param-reassign */
    typeObj[type] = Object.values(configDic)
      .filter((entry) => entry.type === type)
      .map((entry) => entry.key);
    return typeObj;
  }, {});
  return regexTagsByType;
})();

function mkRegex(inputs) {
  const parsers = inputs.reduce((acc, input) => {
    return `${acc}${parserDic(input)}`;
  }, '');
  return new RegExp(parsers);
}

/**
 * Replace
 * see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
 * @function
 */
function parseAliases(aliases, cfg, DEBUG = false) {
  // [alias] -> [value]
  const re = mkRegex(cfg.parsers);
  const result = aliases.reduce((arrows, alias) => {
    /* eslint-disable-next-line no-param-reassign */
    arrows[alias] = alias.replace(re, cfg.output);
    return arrows;
  }, {});
  if (DEBUG) {
    console.debug(`parseAliases result`);
    console.dir(result);
  }
  return result;
}

/**
 * Returns the arrows object
 *
 * @function
 * @param {string} expressionDicTag regexTags import
 * @param {Array<string>} fieldAliases wtlf prop value
 * @return {Object}
 */
export function parse({ parser: expressionDicTag, items, DEBUG = false }) {
  if (DEBUG) {
    console.debug('regex', expressionDicTag);
    console.dir(items);
  }
  return parseAliases(items, selectConfig(expressionDicTag), DEBUG);
}
