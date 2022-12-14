# Bugomattic (Ragnarok)

## Overview

Bugomattic is a tool that guides bug reporters to the right actions within large, complex organizations.
It provides a highly configurable way to answer the question of "where should I report a bug I am seeing?"

This tool is developed to be an internal tool for Automatticians. It is built with wepback and deployed
within Automattic's internal sites. Others who find it useful may fork it and adapt it to work it for
their organization, following the GPL 2.0 license.

For Automatticians... this is the up & coming tool that replaces the existing Bugomattic prototype.

## Development

### Quick Start

Dependencies: `git`, `node`, and `yarn`.

1. Clone the repository: `git clone [https or ssh link to repo]`
2. In the repository root, install dependencies: `yarn`
3. Start the application in development mode: `yarn start`

### Create React App

This app was initially bootstrapped with [Create React App](https://create-react-app.dev/).
We will likely outgrow the simple bootstrapping and eventually need to
[eject](https://create-react-app.dev/docs/available-scripts/#npm-run-eject), but for now
it makes the most sense to rely on the simplicity of the built-in `react-scripts`.

### Helpful Commands

- `yarn start`: Run the app locally in development mode. This mode will use faked data instead of backend APIs.
  It includes hot-reloading.
- `yarn build`: Bundle the app for A8c production deployment. Bundles the application into the `dist` folder.
- `yarn test`: Run tests in watch mode (automatically retests on changes).
- `yarn test:once`: Run tests once, without watching.
- `yarn test:once --coverage`: See unit test coverage.
- `yarn lint`: Lint code and markdown files. Doesn't auto-fix.
- `yarn lint:fix`: Lint and autofix code and markdown files.

### Testing Locally with Local Reporting Configs

A lot of Bugomattic is driven by the "reporting config," a configuration that maps issue reporting preferences for different
features and issue types. In production, this reporting config is delivered by the REST API. For local testing, we serve local JSON files.

To test with a local reporting config, add the JSON file to `public/local-reporting-configs`,
and then set the ENV variable `REACT_APP_REPORTING_CONFIG_NAME` to the name of the file.

E.g. `REACT_APP_REPORTING_CONFIG_NAME='test' yarn start` for a file at `public/local-reporting-configs/test.json`.

By default, the local app will use the `default.json` file in that directory.
**Do not commit any other JSON files other than the default.json file, and do not commit a modified default file without an important reason.**
There is a `.gitignore` rule that should block other reporting configs from being committed.

### Linting

This project uses `eslint` and `prettier` to lint and format code files. For almost everything, we use `eslint`
to run `prettier`. The main exception is `.css` files, which are formatted directly by `prettier`.

There are Husky pre-commit hooks that will block committing if files fail linting/formatting checks.

If you are using VSCode, we highly recommend installing the relative extensions and configure fixing & formatting on save.

Add the following extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Then add the following to your VSCode settings.json:

```json
{
	// Run ESLint when a file is saved
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},

	// Enable ESLint formatter
	"eslint.format.enable": true,

	// Use ESlint as the default formatter
	"editor.defaultFormatter": "dbaeumer.vscode-eslint",

	// Equivalent to `editor.codeActionsOnSave` and deprecated, but
	// Prettier plugin still depends on it
	"editor.formatOnSave": true,

	// Use prettier for CSS files
	"[css]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
}

```

### Other Style Guids & Conventions

#### Tests

Test files should be colocated with the files under test. Within a directory, create a `__tests__` directory,
and name the test file `[file-under-test].test.ts[x]`.

#### CSS

CSS for a component should be colocated with that component. When possible, rely on
[CSS Modules](https://github.com/css-modules/css-modules) instead of establishing namespaces in naming conventions.

To work with CSS Modules, class names should use `camelCase`.

#### File names

Fill names should use `kebab-casing`.

#### Named exports

Use named exports instead of default exports.

```typescript
// Do this
export const FooBar;

// Or this
export function FooBar();

// Not this
const FooBar;
export default FooBar;
```

#### Components

Components should use PascalCase, and should use `function` syntax if possible.

Props for a component should be declared in a local interface called `Props`.

```tsx
import React, { ReactNode } from 'react';

interface Props {
	text: string;
	children: ReactNode;
}

export function MyComponent( { text, children }: Props ) {
	return (
		<div>
			<p>{ text }</p>
			{ children }
		</div>
	)
}
```

#### App-Specific Typed Hooks

Instead of the base react-redux `useSelector` and `useDispatch`, use the re-exported hooks `useAppSelector` and `useAppDispatch`.

These hooks provide app-specific typings to the core react-redux hooks and will keep your code more type-safe.

For reference, check out the [Redux recommendations for TypeScript](https://redux.js.org/usage/usage-with-typescript#define-typed-hooks).

#### Directory Structure and Indexing

This project generally aims to follow [colocation](https://kentcdodds.com/blog/colocation) for its directory structure. Related code files are placed together.

Specifically, we create directories for the different functional areas of the app and places all the various files related to that area
(Redux state, components, css, tests) together under that directory.

In general, you should avoid using `index` files. Because we are prioritizing colocation, and also because many Redux/React conventions export global constants,
using `index` files can lead to over-importing and circular dependency issues.

An exception to the `index` rule is when you have a subdirectory that consists of similar files (like a subdirectory with only private helper components).
