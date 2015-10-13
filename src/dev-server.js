import kit from 'nokit';
import utils from './utils';
import config from './public-config';

let {
    pageDev, asset, mock,
    src, favicon
} = config.paths;
let rawPaths = config.rawPaths;
let { _ } = kit;
let br = kit.require('brush');
let proxy = kit.require('proxy');
let { match, select } = proxy;
let serverHelper = proxy.serverHelper();
let opts = JSON.parse(process.argv[2]);

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
        let tpl = require(pageDev)({
            vendor: `/${rawPaths.assetPage}/vendor.js`,
            page: `/${rawPaths.assetPage}/${$.url.page}.js`
        });

        // 插入自动重载等工具函数到页面
        $.body = tpl + kit.browserHelper();
    }),

    // favicon
    select('/favicon.ico', kit.readFile(favicon)),

    // 静态资源
    [asset, src].map(path => select(`/${rawPaths.asset}`, proxy.static({
        root: path,
        onFile: _.ary(serverHelper.watch, 1)
    })))
]).flatten().compact().value());

(async () => {
    // 载入 mock 入口点
    let isLoadMock = true;
    try {
        require.resolve(mock);
        kit.logs(`load module "${mock}"`);
    } catch (err) {
        isLoadMock = false;
        kit.logs(br.yellow(`skip module "${mock}"`));
    }

    if (isLoadMock) require(mock)(app, opts);

    await app.listen(opts.port);

    kit.logs('dev server listen at:', br.cyan(opts.port));
})().catch(kit.throw);
