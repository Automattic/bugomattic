module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:prettier/recommended',
		'plugin:md/prettier',
	],
	parser: '@typescript-eslint/parser',
	root: true,
	settings: {
		react: {
			version: 'detect',
		},
	},
	overrides: [
		{
			files: [ '*.md' ],
			parser: 'markdown-eslint-parser',
			rules: {
				'prettier/prettier': [
					'error',
					// Important to force prettier to use "markdown" parser - otherwise it wouldn't be able to parse *.md files.
					// You also can configure other options supported by prettier here - "prose-wrap" is
					// particularly useful for *.md files
					{ parser: 'markdown' },
				],
			},
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	plugins: [ 'react', '@typescript-eslint' ],
	rules: {},
};
