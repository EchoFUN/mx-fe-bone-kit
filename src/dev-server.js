import kit from 'nokit';
import utils from './utils';
import {
    pageDevPath, assetPath, mockPath,
    srcPath, faviconPath
} from './public-env';

let { _ } = kit;
let br = kit.require('brush');
let proxy = kit.require('proxy');
let { match, select } = proxy;
let serverHelper = proxy.serverHelper();
let opts = JSON.parse(process.argv[2]);
let pageDev = require(pageDevPath);

if (opts.port === '<%= port %>')
    opts.port = 8080;

utils.checkPort(opts.port);

// 总入口服务
let app = proxy.flow();

app.push.apply(app, _.chain([
    utils.accessLog('access:'),

    serverHelper,

    // 入口页面路由
    select(match('/:page'), async ($) => {
        let tpl = pageDev({
            vendor: '/asset/js/page/vendor.js',
            page: `/asset/js/page/${$.url.page}.js`
        });

        // 插入自动重载等工具函数到页面
        $.body = tpl + kit.browserHelper();
    }),

    // favicon
    select('/favicon.ico', kit.readFile(faviconPath)),

    // 静态资源
    [assetPath, srcPath].map(path => select('/asset', proxy.static({
        root: path,
        onFile: _.ary(serverHelper.watch, 1)
    })))
]).flatten().compact().value());

(async () => {
    // 载入 mock 入口点
    let isLoadMock = true;
    try {
        require.resolve(mockPath);
        kit.logs(`load module "${mockPath}"`);
    } catch (err) {
        isLoadMock = false;
        kit.logs(br.yellow(`skip module "${mockPath}"`));
    }

    if (isLoadMock) require(mockPath)(app, opts);

    await app.listen(opts.port);

    kit.logs('dev server listen at:', br.cyan(opts.port));
})().catch(kit.throw);
