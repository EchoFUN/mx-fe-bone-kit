import webpack from 'webpack';
import kit from 'nokit';
import config from './public-config';

let {
    srcPage, packageJson, assetPage
} = config.paths;

let isProduction = process.env.NODE_ENV === 'production';
let { _ } = kit;

let entry = kit.globSync(`${srcPage}/**/*.js`).reduce((ret, p) => {
    ret[kit.path.basename(p, '.js')] = p;
    return ret;
}, {});

entry.vendor = _.keys(require(packageJson).dependencies);

let self = {
    entry: entry,

    plugins: [
        new webpack.optimize.CommonsChunkPlugin(
            'vendor',
            isProduction ? 'vendor.min.js' : 'vendor.js'
        ),
        require('./webpack-notifier')()
    ],

    output: {
        filename: isProduction ? '[name].min.js' : '[name].js',
        path: assetPage
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
            }
        ]
    }
};

if (isProduction) {

    self.plugins.push(new webpack.optimize.UglifyJsPlugin());

    // eslint
    self.module.preLoaders = [
        {
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'eslint'
        }
    ];
    self.eslint = {
        failOnError: true
    };

} else {

    self.output.pathinfo = true;
    self.debug = true;

}

export default self;
