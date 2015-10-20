import kit from 'nokit';

let cwd = process.cwd();
let br = kit.require('brush');
let jhash = kit.require('jhash');
jhash.setSymbols('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

function hashSuffix (hashMap) {
    let map = {};
    return kit._.assign(function (f) {
        var src;
        if (f.isDir) return;
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
        return kit.warp(`${opts.asset}/**/*.js`)
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
        .run(opts.asset);
    };

    let compileTpl = (hashMap) => {
        let list = kit.globSync(`${opts.srcPage}/**/*.js`);
        list.forEach((path) => {
            let name = kit.path.basename(path, '.js');
            let tpl = require(`${cwd}/${opts.pageDev}`)({
                vendor: opts.cdnPrefix + '/' + hashMap[`${opts.assetPage}/vendor.min.js`],
                page: opts.cdnPrefix + '/' + hashMap[`${opts.assetPage}/${name}.min.js`]
            });
            kit.outputFileSync(`${opts.asset}/${name}.html`, tpl);
        });
    };

    return kit.warp(`${opts.asset}/**`)
    .load(drives.reader({ isCache: false, encoding: null }))
    .load(hashSuffix(opts.hashMap))
    .run(opts.asset)
    .then(() => {
        return kit.readJson(opts.hashMap);
    }).then(async (hashMap) =>
        await * [compileCDN(hashMap), compileTpl(hashMap)]
    );
};
