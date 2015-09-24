import kit from 'nokit';
import utils from './utils';
import pageDev from '../page/dev';

let { _, Promise } = kit;
global.Promise = Promise;
let br = kit.require('brush');
let proxy = kit.require('proxy');
let { match, select } = proxy;
let serverHelper = proxy.serverHelper();
let opts = JSON.parse(process.argv[2]);

// 总入口服务
let app = proxy.flow();

app.push.apply(app, _.flatten([
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
    select('/favicon.ico', kit.readFile('src/img/favicon.ico')),

    // 静态资源
    ['asset', 'src'].map(path => select('/asset', proxy.static({
        root: path,
        onFile: _.ary(serverHelper.watch, 1)
    })))
]));

(async () => {
    utils.checkPort(opts.port);

    opts.app = app;
    utils.requireEtc('mock', opts);
    utils.requireEtc('proxy', opts);

    await app.listen(opts.port);

    kit.logs('dev server listen at:', br.cyan(opts.port));
})();
