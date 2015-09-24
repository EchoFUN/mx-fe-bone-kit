import webpack from 'webpack';
import kit from 'nokit';
import { srcJsPagePath, packageJsonPath, assetJsPagePath } from './public-env';

let isProduction = process.env.NODE_ENV === 'production';
let { _ } = kit;

let entry = kit.globSync(`${srcJsPagePath}/**/*.js`).reduce((ret, p) => {
    ret[kit.path.basename(p, '.js')] = p;
    return ret;
}, {});

entry.vendor = _.keys(require(packageJsonPath).dependencies);

let self = {
    entry: entry,

    plugins: [
        new webpack.optimize.CommonsChunkPlugin(
            'vendor',
            isProduction ? 'vendor.min.js' : 'vendor.js'
        )
    ],

    output: {
        filename: isProduction ? '[name].min.js' : '[name].js',
        path: assetJsPagePath
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

export default self;
