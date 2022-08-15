module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'next',
    'plugin:@next/next/recommended',
    'next/core-web-vitals',
    'plugin:storybook/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json',
  },
  plugins: ['react', '@typescript-eslint', 'jest', 'testing-library'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': [
      2,
      {
        extensions: [
          // '.js',
          // '.jsx',
          '.ts',
          'tsx',
        ],
      },
    ],
    'react/require-default-props': 'off',
    'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
    'import/extensions': [
      2,
      {
        // js: 'never',
        // jsx: 'never',
        ts: 'never',
        tsx: 'never',
        json: 'always',
      },
    ],
  },
  overrides: [
    {
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        // '**/*.test.js',
        // '**/*.test.jsx',
        '**/__tests__/**/*.ts',
        '**/__tests__/**/*.tsx',
        // '**/__tests__/**/*.js',
        // '**/__tests__/**/*.jsx',
      ],
      extends: ['plugin:jest/recommended', 'plugin:jest/style', 'plugin:testing-library/react'],
    },
    {
      files: [
        '**/*.stories.ts',
        '**/*.stories.tsx',
        // '**/*.stories.js',
        // '**/*.stories.jsx'
      ],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
