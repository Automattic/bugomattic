module.exports = {
  env: {
    browser: true,
    es2021: true,
	node: true
  },
  extends: [
	'eslint:recommended',
	'plugin:@typescript-eslint/recommended',
	'plugin:react/recommended',
  ],
  parser: '@typescript-eslint/parser',
  root: true,
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
	ecmaFeatures: {
		jsx: true
	}
  },
  plugins: [
    'react',
	'@typescript-eslint'
  ],
  rules: {
	'semi': ['error', 'always'],
	'quotes': ['error', 'single', { 'allowTemplateLiterals': true, 'avoidEscape': true }]
  }
};
