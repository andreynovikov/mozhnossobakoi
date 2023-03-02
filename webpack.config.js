const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const CopyPublicFolderPlugin = function(cb) {
    this.apply = function(compiler) {
        if (compiler.hooks && compiler.hooks.done) {
            compiler.hooks.done.tap('copy-public-folder', () => {
                fs.copySync('public', 'build', {
                    dereference: true,
                    filter: file => file !== 'public/index.html',
                });
            });
        }
    };
};

const config = {
    entry: path.join(__dirname, 'src', 'index.js'),
    output: {
        clean: true,
        path: path.resolve(__dirname, 'build'),
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/media/[name].[hash][ext]',
        publicPath: '/',
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                exclude: /@babel(?:\/|\\{1,2})runtime/,
                test: /\.(js|jsx|css)$/,
                loader: require.resolve('source-map-loader'),
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: require.resolve('babel-loader'),
                    options: {
                        presets: [
                            '@babel/preset-env',
                            ["@babel/preset-react", {"runtime": "automatic"}]
                        ],
                        plugins: []
                    }
                }
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: require.resolve('css-loader'),
                        options: {}
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public', 'index.html'),
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
        new ESLintPlugin({
            eslintPath: require.resolve('eslint'),
            failOnError: false,
            formatter: './eslint-formatter.js',
        })
    ],
    optimization: {
        minimize: false,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        comparisons: false,
                        inline: 2
                    },
                    mangle: {
                        safari10: true
                    },
                    output: {
                        ecma: 5,
                        comments: false,
                        ascii_only: true
                    }
                }
            }),
            new CssMinimizerPlugin()
        ],
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    cache: {
        type: 'filesystem',
        buildDependencies: {
            config: [__filename],
        },
    },
    devServer: {
        historyApiFallback: true,
        server: 'https',
        client: {
            overlay: {
                warnings: false,
                errors: true
            },
            webSocketTransport: 'ws',
        },
        webSocketServer: 'ws',
        allowedHosts: 'all',
        port: 3000,
        proxy: {
            '/api': 'http://localhost:5000',
            '/sitemap.xml': 'http://localhost:5000'
        }
    }
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = 'cheap-module-source-map';
        config.module.rules[1].use.options.plugins.unshift( // js
            require.resolve('react-refresh/babel')
        );
        config.module.rules[2].use.unshift( // css
            require.resolve('style-loader')
        );
        config.plugins.push(
            new ReactRefreshWebpackPlugin()
        );
    }

    if (argv.mode === 'production') {
        config.bail = true; // stop on first error
        config.output.filename = 'static/js/[name].[contenthash:8].js';
        config.output.chunkFilename = 'static/js/[name].[contenthash:8].chunk.js';
        config.module.rules[2].use.unshift( // css
            {
                loader: MiniCssExtractPlugin.loader,
                // css is located in `static/css`, use '../../' to locate index.html folder
                options: { publicPath: '../../' }
            }
        );
        config.plugins[3].options.failOnError = true; // eslint
        config.plugins.push(
            new CopyPublicFolderPlugin(),
        );
        config.optimization.minimize = true;
    }

    return config;
};
