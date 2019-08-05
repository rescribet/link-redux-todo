const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const production = process.env.NODE_ENV === 'production';

module.exports = {
    entry: ['./src/index.js'],
    mode: production ? 'production' : 'development',
    devtool: 'source-map',
    output: {
      filename: "index.js",
      libraryTarget: 'umd',
      path: path.resolve(__dirname)
    },
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
            { from: './node_modules/todomvc-common/base.css', to: './dist/css/' },
            { from: './node_modules/todomvc-app-css/index.css', to: './dist/css/' },
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
        'solid-auth-client': 'SolidAuthClient',
        'rdflib': 'Rdflib',
        'react': 'React',
        'link-lib': 'LinkLib',
        'link-redux': 'LinkRedux',
    }
}
