import kit from 'nokit';
import pacSetter from './pac-set';

let {
    _
} = kit;
let proxy = kit.require('proxy');
let {
    select
} = proxy;
let br = kit.require('brush');

let pacPath = '/pac';

export default async(opts) => {
    let app = proxy.flow();

    app.push.apply(app, _.chain([
        // provide proxy auto config.
        // pac address is http://127.0.0.1:${opts.port}/${opts.pac}
        // graphic tutorials: http://www.artica.fr/download/Proxy_Configuration_Mac_OSX_Leopard.pdf
        // see https://support.apple.com/kb/PH10934?locale=en_US
        // see https://en.wikipedia.org/wiki/Proxy_auto-config
        select(pacPath, async($) => {
            $.body = `function FindProxyForURL(url, host) {
                    if (shExpMatch(host, "${opts.host}")) {
                        return "PROXY 127.0.0.1:${opts.proxyPort}";
                    }
                    return "DIRECT";
                }`;
        }),

        select(/.*/, proxy.url(`127.0.0.1:${opts.port}`))
    ]).flatten().compact().value());

    await app.listen(opts.proxyPort);
    kit.logs('inner pac proxy server listen at:', br.cyan(opts.proxyPort));

    await pacSetter(opts.proxyPort);
};