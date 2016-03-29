'use strict';

const webpack = require('webpack');
const path = require('path');
const colors = require('colors/safe');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const ENV = process.env;

// Default values are set in the package.json.
// These values are fallback values in case
// webpack is running directly, without npm run scripts.
const API_HOST = ENV.GEN_FRONTEND_API_HOST || 'localhost';
const API_PORT = ENV.GEN_FRONTEND_API_PORT || 5000;
// Keep alive timeout in seconds
const SESSION_KEEP_ALIVE_TIMEOUT = ENV.GEN_SESSION_KEEP_ALIVE_TIMEOUT || 60;
const SESSION_LOGOUT_TIMEOUT = ENV.GEN_SESSION_LOGOUT_TIMEOUT || 5*60;
const SESSION_LOGOUT_WARNING_TIMEOUT = ENV.GEN_SESSION_LOGOUT_WARNING_TIMEOUT || 15;
const HEADER_SESSION = ENV.GEN_HEADER_SESSION || 'X-Session-Id';
const HEADER_LANGUAGE = ENV.GEN_HEADER_LANGUAGE || 'X-Language-Id';

const ENABLE_SOURCE_MAPS = ENV.GEN_FRONTEND_ENABLE_SOURCE_MAPS || false;
const devtool = (ENABLE_SOURCE_MAPS) ? 'source-map' : '#eval';

console.log(colors.bold('-> Source maps ' + (ENABLE_SOURCE_MAPS ? 'ENABLED!' : 'disabled.')));
console.log(colors.bold('-> API host: ', API_HOST));
console.log(colors.bold('-> API port: ', API_PORT));
console.log('');

module.exports = {

    devtool,

    entry: [
        'webpack/hot/dev-server',
        './app/app.js'
    ],

    output: {
        path: path.resolve(__dirname, '../public'),
        filename: 'genomics.js'
    },
    module: {
        loaders: [
            {test: /\.json$/, loader: 'file?name=[name].[ext]'},
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components|vendor)/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015']
                }
            },
            {test: /bootstrap\/js\//, loader: 'imports?jQuery=jquery'},

            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=[name].[ext]&limit=10000&mimetype=application/font-woff'},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=[name].[ext]&limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=[name].[ext]&limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=[name].[ext]'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=[name].[ext]'},

            {test: /\.png$/, loader: 'url-loader?limit=100000'},
            {test: /\.jpg$/, loader: 'file-loader'},
            {test: /\.gif$/, loader: 'url-loader?mimetype=image/png'},

            // Extract css files
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
            }
        ]
    },

    resolve: {
        extensions: ['', '.js', '.jsx', '.css', 'less']
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        // Cleanup target folder.
        new CleanWebpackPlugin(['public'], {
            root: __dirname + '/../',
            verbose: true,
            dry: false
        }),
        new ExtractTextPlugin('genomics.css', {
            allChunks: true
        }),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            _: 'lodash'
        }),

        new webpack.DefinePlugin({
            API_PORT: JSON.stringify(API_PORT),
            API_HOST: JSON.stringify(API_HOST),
            HEADER_SESSION: JSON.stringify(HEADER_SESSION),
            HEADER_LANGUAGE: JSON.stringify(HEADER_LANGUAGE),
            SESSION_KEEP_ALIVE_TIMEOUT: JSON.stringify(SESSION_KEEP_ALIVE_TIMEOUT),
            SESSION_LOGOUT_TIMEOUT: JSON.stringify(SESSION_LOGOUT_TIMEOUT),
            SESSION_LOGOUT_WARNING_TIMEOUT: JSON.stringify(SESSION_LOGOUT_WARNING_TIMEOUT)
        })
    ]
};
