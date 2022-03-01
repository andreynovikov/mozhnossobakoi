module.exports = {
    parserOptions: {
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
            presets: ["@babel/preset-react"]
        },
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 'latest',
    },

    parser: '@babel/eslint-parser',

    plugins: ['react', 'import', 'react-hooks'],

    env: {
        browser: true,
        commonjs: true,
        es6: true,
        es2021: true
    },

    settings: {
        react: {
            version: 'detect',
        },
    },

    extends: [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
    ],

    rules: {
        'no-extra-semi': 'warn',
        'no-unused-vars': 'warn',

        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-filename-extension': [1, { 'extensions': ['.js', '.jsx'] }],

        'react/no-unescaped-entities': 'warn',

        // CRA
        'react/require-render-return': 'error',

        'react-hooks/rules-of-hooks': 'error',

        'no-restricted-properties': [
            'error',
            {
                object: 'require',
                property: 'ensure',
                message:
                'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
            },
            {
                object: 'System',
                property: 'import',
                message:
                'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
            },
        ],

        'import/first': 'error',
        'import/no-amd': 'error',
        'import/no-anonymous-default-export': 'warn',
        'import/no-webpack-loader-syntax': 'error',
    },
}
