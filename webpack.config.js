const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './src/app.jsx'],
    mode: "development",
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
                    plugins: ['@babel/plugin-transform-react-jsx'],
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
    ]
}