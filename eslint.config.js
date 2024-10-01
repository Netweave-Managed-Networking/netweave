import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import pluginTs from 'typescript-eslint';

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    ignores: [
      'vendor/*',
      'node_modules/*',
      'dist/*',
      'build/*',
      'public/build/*',
      'public/js/*',
      'storage/*',
      '**/*.config.js',
      'coverage/*',
      '__snapshots__/*',
    ],
  },
  { languageOptions: { globals: globals.browser } },
  { settings: { react: { version: 'detect' } } },
  pluginJs.configs.recommended,
  ...pluginTs.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];
