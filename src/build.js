import kit from 'nokit';
import config from './public-config';

let { hashMap, asset,
    srcPage, pageDev
} = config.paths;

let { rawPaths } = config;
let cwd = process.cwd();
let br = kit.require('brush');
let jhash = kit.require('jhash');
jhash.setSymbols('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

function hashSuffix (hashMap) {
    let map = {};
    return kit._.assign(function (f) {
        var src;
        src = kit.path.relative(cwd, f.dest + '');
        f.dest.name += '.' + jhash.hash(f.contents);
        return map[src] = kit.path.relative(cwd, f.dest + '');
    }, {
        onEnd: function () {
            return kit.outputJson(hashMap, map);
        }
    });
}

export default (opts) => {
    kit.require('url');

    let regCDN = /(\\?['"\(])([^'"\(]+?__CDN__[^'"\)]*?)(\\?['"\)])/g;
    let drives = kit.require('drives');

    let compileCDN = (hashMap) => {
        return kit.warp(`${asset}/**/*.js`)
        .load(drives.reader({ isCache: false }))
        .load((f) => {
            f.set(f.contents.replace(regCDN, function (m, left, p, right) {
                p = kit.url.parse(p, true);
                delete p.search;
                delete p.query.__CDN__; // eslint-disable-line
                p.pathname = opts.cdnPrefix + '/' + hashMap[p.pathname.slice(1)];
                kit.logs(br.cyan('cdn:'), p.pathname);
                p = kit.url.format(p);
                return left + p + right;
            }));
        })
        .run(asset);
    };

    let compileTpl = (hashMap) => {
        let list = kit.globSync(`${srcPage}/**/*.js`);
        list.forEach((path) => {
            let name = kit.path.basename(path, '.js');
            let tpl = require(pageDev)({
                vendor: opts.cdnPrefix + '/' + hashMap[`${rawPaths.assetPage}/vendor.min.js`],
                page: opts.cdnPrefix + '/' + hashMap[`${rawPaths.assetPage}/${name}.min.js`]
            });
            kit.outputFileSync(`${asset}/${name}.html`, tpl);
        });
    };

    return kit.warp(`${asset}/**`)
    .load(drives.reader({ isCache: false, encoding: null }))
    .load(hashSuffix(hashMap))
    .run(asset)
    .then(() => {
        return kit.readJson(hashMap);
    }).then(async (hashMap) =>
        await * [compileCDN(hashMap), compileTpl(hashMap)]
    );
};
