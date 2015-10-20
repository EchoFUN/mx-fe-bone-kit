// 这只是个示例文件，不会被版本跟踪
import kit from 'nokit';
import config from './public-config';

let proxy = kit.require('proxy');
let serverHelper = proxy.serverHelper();

let { match, select } = proxy;
let { _ } = kit;

export default (app, opts) => {
    let rawPaths = config.rawPaths;
    let {
        pageDev, asset,
        src, favicon
    } = config.paths;

    // 默认路由服务
    app.push.apply(app, _.chain([

        select(/^\/$/, async ($) => {
            if(await kit.exists(`${src}/page/demo.js`))
                $.res.setHeader('Location', '/demo');
            else
                return $.next();
        }),

        // favicon
        select('/favicon.ico', kit.readFile(favicon)),

        // 入口页面路由
        select(match('/:page'), async ($) => {
            let tpl = require(pageDev)({
                vendor: `/${rawPaths.assetPage}/vendor.js`,
                page: `/${rawPaths.assetPage}/${$.url.page}.js`
            });

            // 插入自动重载等工具函数到页面
            $.body = tpl + kit.browserHelper();
        }),

        // 静态资源
        [asset, src].map(path => select(`/${rawPaths.asset}`, proxy.static({
            root: path,
            onFile: _.ary(serverHelper.watch, 1)
        })))

    ]).flatten().compact().value());
};