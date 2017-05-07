'use strict';

const webpack = require('webpack'),
    path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.min.js',
        path: path.resolve(__dirname, 'public', 'js')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['latest']
                }
            }
        }]
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({})
    ]
};
