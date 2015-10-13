// 这里是全部对外的路径规则

import kit from 'nokit';

let { _ } = kit;

let cwd = process.cwd();
let packageJson = kit.readJsonSync(`${cwd}/package.json`);
let config = packageJson['mx-fe-bone'] || {};

config = _.defaultsDeep(config, {
    paths: {
        mockPath: 'mock/index.js',

        pagePath: 'page',
        pageDevPath: 'page/dev.js',

        assetPath: 'asset',
        assetPagePath: 'asset/page',

        srcPath: 'src',
        srcPagePath: 'src/page',

        faviconPath: 'src/img/favicon.ico',
        hashMapPath: 'asset/hash-map.json',
        webpackConfigPath: 'webpack.config.js',
        packageJsonPath: 'package.json'
    }
});

config.rawPaths = _.cloneDeep(config.paths);

_.each(config.paths, (v, k) => {
    config.paths[k] = `${cwd}/${v}`;
});

export default config;
