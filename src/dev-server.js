import kit from 'nokit';
import utils from './utils';
import config from './public-config';
import devproxy from './dev-proxy';

let {
    mock
} = config.paths;
let br = kit.require('brush');
let proxy = kit.require('proxy');
let serverHelper = proxy.serverHelper();

let opts = JSON.parse(process.argv[2]);

if (opts.port === '<%= port %>')
    opts.port = 8080;
if (opts.transPort === '<%= transPort %>')
    opts.transPort = 54321;

utils.checkPort(opts.port);

// 总入口服务
let app = proxy.flow();

// 日志和帮助服务
app.push(
    utils.accessLog('access:'),
    serverHelper
);

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

(async() => {
    await app.listen(opts.port, opts.transPort);
    kit.logs('dev server listen at:', br.cyan(opts.port));

    // start proxy server
    await devproxy(opts);
})().catch(kit.throw);