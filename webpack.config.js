const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const browser = process.env.browser || 'chrome';

    return {
        entry: {
            background: './src/common/background.js',
            sidepanel: './src/common/sidepanel.js',
            styles: './src/common/styles/tailwind.css',
        },
        output: {
            path: path.resolve(__dirname, 'build', browser), filename: '[name].js'
        },
        module: {
            rules: [{
                test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader']
            }]
        },
        plugins: [new CopyWebpackPlugin({
            patterns: [
                {from: `src/${browser}/manifest.json`, to: 'manifest.json'},
                {from: 'src/sidepanel.html', to: 'sidepanel.html'},
                {from: 'src/common/icons', to: 'icons'},
                {from: 'src/common/styles', to: 'styles'}]
        }),],
        mode: argv.mode === 'development' ? 'development' : 'production',
        devtool: argv.mode === 'development' ? 'inline-source-map' : false,
        watch: argv.mode === 'development'
    };
};
