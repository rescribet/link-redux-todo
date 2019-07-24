const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const production = process.env.NODE_ENV === 'production';

module.exports = {
    entry: ['babel-polyfill', './src/app.jsx'],
    mode: production ? 'production' : 'development',
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                    plugins: [
                      '@babel/plugin-transform-react-jsx',
                      '@babel/plugin-proposal-class-properties',
                      '@babel/plugin-proposal-optional-chaining',
                    ],
                    presets: ['@babel/preset-env']
                }
              }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: './node_modules/todomvc-common/base.css', to: './css/' },
            { from: './node_modules/todomvc-app-css/index.css', to: './css/' },
        ]),
        new webpack.DefinePlugin({
          FRONTEND_ROUTE: production
            ? JSON.stringify('https://fletcher91.github.io/link-redux-todo/')
            : JSON.stringify('http://localhost:8000/'),
        }),
    ],
    externals: {
        jsonld: '{}',
        'node-fetch': 'fetch',
    }
}
