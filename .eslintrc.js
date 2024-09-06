module.exports = {
  env: {
    jest: true,
  },
  plugins: ['import', 'simple-import-sort'],
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',

    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'class-methods-use-this': ['off'],
  },
};
