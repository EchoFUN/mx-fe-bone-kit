import kit from 'nokit';
import utils from './utils';
import devProxy from './dev-proxy';

let br = kit.require('brush');
let proxy = kit.require('proxy');
let serverHelper = proxy.serverHelper();
let opts = JSON.parse(process.argv[2]);
let mock = `${process.cwd()}/${opts.mock}`;
let port = Number(opts.port) || 8732;

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

    await app.listen(port);

    // start proxy server
    await devProxy(opts, port);

})().catch(kit.throw);
