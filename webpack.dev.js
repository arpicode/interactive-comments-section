const path = require('path')
const { merge } = require('webpack-merge')
const sharedConfig = require('./webpack.common.js')

module.exports = merge(sharedConfig, {
    mode: 'development',
    devtool: false,
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.scss$/i,
                include: path.resolve(__dirname, 'src/scss'),
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
})
