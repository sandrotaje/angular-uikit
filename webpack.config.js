var webpack = require("webpack");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


var config = {
    entry: "./src/angular-uikit.js",
    output: {
        path: "./dist",
        filename: "angular-uikit.min.js"
    },
    devtool: "cheap-module-source-map",
    devServer: {
        inline: true,
        contentBase: "./dist",
        port: 8100
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['ng-annotate-loader', 'babel-loader?presets[]=es2015'],
                exclude: /node_modules/
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|jpg|png|json)$/,
                use: 'file-loader?name=[path][name].[ext]?[hash]'
            },
            {
                test: /\.(scss|css)$/,
                use: ExtractTextPlugin.extract({ 
                    fallbackLoader: "style-loader", 
                    loader: "css-loader?minimize=true!sass-loader"
                }),
            }]
    },
    plugins: [
        new ExtractTextPlugin("angular-uikit.min.css")
        // ,
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     },
        //     comments: false
        // })
    ]
}

module.exports = config;