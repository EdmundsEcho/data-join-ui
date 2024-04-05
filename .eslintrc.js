// ./.eslintrc.js

//------------------------------------------------------------------------------
// eslint config
//------------------------------------------------------------------------------
// Last updated Nov 26, 2020
//------------------------------------------------------------------------------
//
// ⬜ Change to yaml
//
//------------------------------------------------------------------------------
module.exports = {
  parser: '@typescript-eslint/parser',
  // parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module',
    // ecmaFeatures: { jsx: true, }, // use eslint-plugin-react
    // ecmaVersion: 11, // set by env
  },
  // processor from a plugin
  // Used in combination with overrides to extract javascript from another file type
  processor: '',

  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },

  // See eslint docs for a full list of env
  // 🔖 Not mutually exclusive so can select many.
  //    Option to use env from plugins; use the 'pluginname/xxx'
  env: {
    browser: true,
    es2020: true, // sets ecmaVersion to 11
    jest: true,
  },

  // if using a global namespace, let eslint know about it to avoid warnings
  globals: {},

  // files to ignore
  ignorePatterns: ['/node_modules/**', '/build/**'],

  //------------------------------------------------------------------------------
  // Plugin configuration
  //------------------------------------------------------------------------------
  /*
   * 🔗 must link to installed plugin name
   *
   * the prefix eslint-plugin- is not required
   * expected location: require('eslint-plugin-name')
   *
   *   "plugins": [
   *       "@jquery/jquery", // means @jquery/eslint-plugin-jquery
   *       "@foobar" // means @foobar/eslint-plugin
   *   ]
   *
   * 🔖 Plugins will subsequently have extends, rules and env entries.
   *
   *    "@typescript-eslint/eslint-plugin": "^4.8.2",
   *    "eslint-plugin-flowtype": "^5.2.0",
   *    "eslint-plugin-import": "^2.22.1",
   *    "eslint-plugin-jest": "^24.1.3",
   *    "eslint-plugin-react": "^7.21.5",
   *
   *  additions
   *    "eslint-plugin-json": "^2.1.2",
   *    "eslint-plugin-material-ui": "^1.0.1",
   *    "eslint-plugin-prettier": "^3.1.4",
   *
   * ⚠️  react-scripts installs the following
   *
   * @typescript-eslint/eslint-plugin": "^4.5.0",
   * eslint-plugin-flowtype": "^5.2.0",
   * eslint-plugin-import": "^2.22.1",
   * eslint-plugin-jest": "^24.1.0",
   * eslint-plugin-jsx-a11y": "^6.3.1",
   * eslint-plugin-react": "^7.21.5",
   * eslint-plugin-react-hooks": "^4.2.0",
   * eslint-plugin-testing-library": "^3.9.2",
   *
   */
  plugins: [
    // extends prefix: plugin:name
    // 'prettier',
    'redux-saga',
    // 'material-ui',
    'import',
    'react',
    'react-hooks',
  ],
  /*
   * 🔖 Extends specifies a group of rules that modify the eslint
   * base set of rules.
   *   Sources for the extension
   *   👉 eslint:recommended modifies the eslint base
   *   👉 a plugin base is usually "all off"; plugin:recommended is
   *      where we actually see the rules take effect.
   *   🔑 Entries are relative to the now configured plugin
   *
   * 🔗 extends -> rules
   * To achieve distinct resolution paths for the base and config files for each
   * plugin, this is the ref computation approach:
   *
   * if extends: ['foo'] AND
   * eslint-config-foo (installed) has plugins['bar']
   * 🟢 ESLint lookup = eslint-plugin-bar in ./node_modules/
   * ⛔ ./node_modules/eslint-config-foo/node_modules/
   *
   * Another e.g.,
   * Plugins emit a configuration file that eslint needs to access
   *
   * "./node_modules/coding-standard/eslintDefault.js'"
   *
   */
  extends: [
    'plugin:redux-saga/recommended',
    // eslint rule settings
    'eslint:recommended',
    'airbnb', // ./node_modules/eslint-config-airbnb/index.js
    // 'react-app',

    // turn on rules from plugins
    // 'plugin:flowtype/recommended',
    'plugin:import/recommended',

    // ⚠️  Sequence matters: put prettier last
    // prettier, turn on, and shut off rules to avoid circular issues
    'prettier',
  ],
  /*
   * The final layer of specifying rules
   * Single rule entries to customize the behavior accordingly
   * use a '/' following the name of the plugin
   * e.g., pluginName/rule
   *
   * 👍 Reduce ref errors: use-the rules in the ./node_modules/ as a
   *    template when making adjustments.
   */
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false,
        // packageDir: './',
      },
    ],
    // eslint
    'no-ternary': 'off',
    // get to compile
    'arrow-body-style': 'off',
    'consistent-return': 'warn',
    'default-param-last': 'warn',
    'lines-between-class-members': 'warn',
    'max-classes-per-file': 'off',
    'no-console': 'warn',
    'no-empty': 'warn',
    'no-nested-ternary': 'warn',
    'no-param-reassign': 'warn',
    'no-restricted-properties': 'warn',
    'no-restricted-globals': 'warn',
    'no-restricted-syntax': 'warn',
    'no-shadow': 'warn',
    'no-underscore-dangle': 'off',
    'no-unsafe-optional-chaining': 'warn',
    'no-unused-expressions': 'warn',
    'no-unused-vars': 'warn',
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: false,
        variables: true,
        allowNamedExports: false,
      },
    ],
    'no-useless-catch': 'warn',
    'object-shorthand': 'warn',
    'prefer-const': 'warn',
    'prefer-exponentiation-operator': 'warn',
    'prefer-regex-literals': 'warn',
    'prefer-template': 'warn',
    'spaced-comment': 'warn',
    quotes: 'off',

    'react/button-has-type': 'warn',
    'react/destructuring-assignment': 'warn',
    'react/display-name': 'warn',
    'react/forbid-prop-types': ['warn', { forbid: ['any', 'object', 'array'] }],
    'react/function-component-definition': 'off',
    'react/jsx-curly-brace-presence': 'warn',
    'react/jsx-filename-extension': 'warn',
    'react/jsx-no-constructed-context-values': 'warn',
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'warn',
    'react/prop-types': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'warn',
    'react/self-closing-comp': 'off',

    // hooks
    'react-hooks/exhaustive-deps': [
      'warn',
      { enableDangerousAutofixThisMayCauseInfiniteLoops: true },
    ],

    // a11y
    'jsx-a11y/click-events-have-key-events': 'off',

    // import
    'import/prefer-default-export': 'off',
    'import/no-named-as-default': 'off',
    'import/no-import-module-exports': 'off',
    'import/extensions': 'off',

    // flowtype
    'flowtype/boolean-style': 0,
    'flowtype/generic-spacing': 0,
    'flowtype/space-after-type-colon': 0,
    'flowtype/space-before-generic-bracket': 0,
    'flowtype/space-before-type-colon': 0,
    'flowtype/union-intersection-spacing': 0,

    // see .prettierrc for prettier rule changes
  },
};
