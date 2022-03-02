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

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';
    const isProduction = argv.mode === 'production';

    return {
        bail: isProduction,
        devtool: isProduction ? false : isDevelopment && 'cheap-module-source-map',
        entry: path.join(__dirname, 'src', 'index.js'),
        output: {
            clean: true,
            path: path.resolve(__dirname, 'build'),
            filename: isProduction ? 'static/js/[name].[contenthash:8].js' : isDevelopment && 'static/js/[name].js',
            chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : isDevelopment && 'static/js/[name].chunk.js',
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
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            type: 'asset',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: 10000,
                                },
                            },
                        },
                        {
                            test: /\.?js$/,
                            exclude: /node_modules/,
                            use: {
                                loader: require.resolve('babel-loader'),
                                options: {
                                    presets: [
                                        '@babel/preset-env',
                                        ["@babel/preset-react", {"runtime": "automatic"}]
                                    ],
                                    plugins: [
                                        isDevelopment && require.resolve('react-refresh/babel')
                                    ].filter(Boolean),
                                }
                            }
                        },
                        {
                            test: /\.css$/i,
                            use: [
                                isDevelopment && require.resolve('style-loader'),
                                isProduction && {
                                    loader: MiniCssExtractPlugin.loader,
                                    // css is located in `static/css`, use '../../' to locate index.html folder
                                    options: { publicPath: '../../' }
                                },
                                {
                                    loader: require.resolve('css-loader'),
                                    options: {},
                                },
                            ].filter(Boolean),
                        },
                        {
                            // Exclude `js` files to keep "css" loader working as it injects
                            // its runtime that would otherwise be processed through "file" loader.
                            // Also exclude `html` and `json` extensions so they get processed
                            // by webpacks internal loaders.
                            exclude: [/^$/, /\.(js|jsx)$/, /\.html$/, /\.json$/],
                            type: 'asset/resource',
                        },
                    ]
                }
            ]
        },
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            comparisons: false,
                            inline: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        output: {
                            ecma: 5,
                            comments: false,
                            ascii_only: true,
                        },
                    },
                }),
                new CssMinimizerPlugin(),
            ],
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
        },
        plugins: [
            isDevelopment && new ReactRefreshWebpackPlugin(),
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
                // Plugin options
                eslintPath: require.resolve('eslint'),
                failOnError: isProduction,
                formatter: './eslint-formatter.js',
            }),
            isProduction && new CopyPublicFolderPlugin(),
        ].filter(Boolean),
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [__filename],
            },
        },
        devServer: {
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
        },
    }
}
