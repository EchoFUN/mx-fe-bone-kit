import webpack from 'webpack';
import kit from 'nokit';


let isProduction = process.env.NODE_ENV === 'production';
let { _ } = kit;
let opts = JSON.parse(process.env['mx-fe-bone-opts']);

let entry = kit.globSync(`${opts.srcPage}/**/*.js`).reduce((ret, p) => {
    ret[kit.path.basename(p, '.js')] = './' + p;
    return ret;
}, {});

entry.vendor = _.keys(require(`${process.cwd()}/package.json`).dependencies);

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
        path: opts.assetPage
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
