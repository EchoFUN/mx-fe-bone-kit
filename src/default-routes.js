// 这只是个示例文件，不会被版本跟踪
import kit from 'nokit';

let proxy = kit.require('proxy');
let serverHelper = proxy.serverHelper();

let { match, select } = proxy;
let { _ } = kit;

export default (app, opts) => {

    // 默认路由服务
    app.push.apply(app, _.chain([

        select(/^\/$/, async ($) => {
            if(!await kit.exists(`${opts.srcPage}/demo.js`))
                return $.next();

            $.res.setHeader('Location', '/demo');
            $.res.statusCode = 302;
        }),

        // favicon
        select('/favicon.ico', kit.readFile(opts.favicon)),

        // 入口页面路由
        select(match('/:page'), async ($) => {
            let tpl = require(`${process.cwd()}/${opts.pageDev}`)({
                vendor: `/${opts.assetPage}/vendor.js`,
                page: `/${opts.assetPage}/${$.url.page}.js`
            });

            // 插入自动重载等工具函数到页面
            $.body = tpl + kit.browserHelper();
        }),

        // 静态资源
        [opts.asset, opts.src].map(path => select(`/${opts.asset}`, proxy.static({
            root: path,
            onFile: _.ary(serverHelper.watch, 1)
        })))

    ]).flatten().compact().value());
};