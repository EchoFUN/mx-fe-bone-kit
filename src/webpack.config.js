let isProduction = process.env.NODE_ENV === 'production';
let cwd = process.cwd();
let webpack = require('webpack');
let kit = require('nokit');
let _ = kit._;

let entry = kit.globSync(`${cwd}/src/js/page/**/*.js`).reduce((ret, p) => {
    ret[kit.path.basename(p, '.js')] = p;
    return ret;
}, {});

entry.vendor = _.keys(require(`${cwd}/package.json`).dependencies);

let self = module.exports = {
    entry: entry,

    plugins: [
        new webpack.optimize.CommonsChunkPlugin(
            'vendor',
            isProduction ? 'vendor.min.js' : 'vendor.js'
        )
    ],

    output: {
        filename: isProduction ? '[name].min.js' : '[name].js',
        path: './asset/js/page'
    },

    module: {
        loaders: [
            {
                test: /\.less$/,
                loader: 'style!css!less'
            },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel?loose=all'
            },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'eslint'
            }
        ]
    }
};

if (isProduction) {
    self.plugins.push(new webpack.optimize.UglifyJsPlugin());
} else {
    self.plugins.push(require('./webpack-notifier')());
    self.output.pathinfo = true;
    self.debug = true;
}
