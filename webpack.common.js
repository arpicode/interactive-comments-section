const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        app: './src/index.js',
    },
    output: {
        assetModuleFilename: (pathData) => {
            const filepath = path.dirname(pathData.filename).split('/').slice(1).join('/')
            return `./${filepath}/[name][ext]`
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.html$/i,
                include: path.resolve(__dirname, 'src'),
                use: ['html-loader'],
            },
            {
                test: /\.(svg|png|jpg|gif|webp)$/i,
                include: path.resolve(__dirname, 'src/images/'),
                type: 'asset/resource',
            },
        ],
    },
}
