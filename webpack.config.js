const Path = require('path');
const Webpack = require('webpack');
//const HtmlWebpackPlugin = require('html-webpack-plugin')
const NODE_ENV = process.env.NODE_ENV;

module.exports = {
    entry: Path.resolve(__dirname, './dev/src/app.js'),
    /*devtool: 'inline-source-map',
    devServer: {
        contentBase: Path.resolve(__dirname, './dev/src')
    },*/
    output: {
        path: Path.resolve(__dirname, './dev/src'),
        filename: 'bundle.js',
        sourceMapFilename: 'bundle.js.map'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                include: Path.resolve(__dirname, './dev/src'),
                use: [
                    {
                        loader: 'style-loader', options: { url: false } // force loader not to parse url
                    },
                    {
                        loader: 'css-loader', options: { url: false }
                    },
                    {
                        loader: 'postcss-loader', options: { // use it's autoprefixer
                            ident: 'postcss',
                            plugins: (loader) => [
                                require('postcss-cssnext')()
                            ]
                        }
                    },
                    {
                        loader: 'sass-loader' // compiles Sass to CSS
                    }
                ]
            }
        ]
    },
    plugins: (() => {

        let plugins = [
            //new HtmlWebpackPlugin({ title: 'Webpack_test' })
        ];

        //if (NODE_ENV.production) {
            plugins.push(new Webpack.optimize.UglifyJsPlugin());
        //}

        return plugins;
    })()
};