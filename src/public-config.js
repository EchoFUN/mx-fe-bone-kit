// 这里是全部对外的路径规则

import kit from 'nokit';

let { _ } = kit;

let cwd = process.cwd();
let packageJson = kit.readJsonSync(`${cwd}/package.json`);
let config = packageJson['mx-fe-bone'] || {};

config = _.defaultsDeep(config, {
    paths: {
        mock: 'mock/index.js',

        pageDev: 'page/dev.js',

        asset: 'asset',
        assetPage: 'asset/page',

        src: 'src',
        srcPage: 'src/page',

        favicon: 'src/img/favicon.ico',
        hashMap: 'asset/hash-map.json',
        webpackConfig: 'webpack.config.js',
        packageJson: 'package.json'
    }
});

config.rawPaths = _.cloneDeep(config.paths);

_.each(config.paths, (v, k) => {
    config.paths[k] = `${cwd}/${v}`;
});

export default config;
