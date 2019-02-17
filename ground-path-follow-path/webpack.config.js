const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopywebpackPlugin = require('copy-webpack-plugin');


// The path to the Cesium source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
    context: __dirname,
    entry: {
        app: './src/index.ts'
    },
    devtool: 'inline-source-map',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),

        // Needed to compile multiline strings in Cesium
        sourcePrefix: '',

    },
    amd: {
        // Enable webpack-friendly use of require in Cesium
        toUrlUndefined: true
    },
    node: {
        // Resolve node module use of fs
        fs: 'empty'
    },
    resolve: {
        alias: {
            // Cesium module name
            cesium: path.resolve(__dirname, cesiumSource)
        },
        extensions: ['.ts', '.js', '.json']
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }, {
                test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
                use: ['url-loader']
            }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopywebpackPlugin([{from: path.join(cesiumSource, cesiumWorkers), to: 'Workers'}]),
        new CopywebpackPlugin([{from: path.join(cesiumSource, 'Assets'), to: 'Assets'}]),
        new CopywebpackPlugin([{from: path.join(cesiumSource, 'Widgets'), to: 'Widgets'}]),
        new webpack.DefinePlugin({
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify('')
        }),
    ],


    // development server options
    devServer: {
        proxy: {
            '/ws': {
                target: 'ws://localhost:8015/ws',
                secure: false,
                ws: true
            },
        }
    }
};

