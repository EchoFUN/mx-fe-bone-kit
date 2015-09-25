// 这里是全部对外的路径规则

import kit from 'nokit';

let { _ } = kit;

let cwd = process.cwd();

export default _.reduce({
    mockPath:            `mock/index.js`,

    pagePath:            `page`,
    pageDevPath:         `page/dev.js`,

    assetPath:           `asset`,
    assetJsPath:         `asset/js`,
    assetJsPagePath:     `asset/js/page`,

    srcPath:             `src`,
    srcJsPagePath:       `src/js/page`,
    faviconPath:         `src/img/favicon.ico`,

    hashMapPath:         'asset/hash-map.json',

    webpackConfigPath:   `webpack.config.js`,
    packageJsonPath:     `package.json`
}, (s, v, k) => {
    s[k] = `${cwd}/${v}`;
    return s;
}, {});
