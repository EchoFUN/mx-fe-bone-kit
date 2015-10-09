import kit from 'nokit';
import publicEnv from './public-env';

let { hashMapPath, assetJsPath, assetPath,
    srcJsPagePath, pageDevPath
} = publicEnv;

let cwd = process.cwd();
let br = kit.require('brush');
let jhash = kit.require('jhash');
jhash.setSymbols('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

function hashSuffix (hashMapPath) {
    let map = {};
    return kit._.assign(function (f) {
        var src;
        src = kit.path.relative(cwd, f.dest + '');
        f.dest.name += '.' + jhash.hash(f.contents);
        return map[src] = kit.path.relative(cwd, f.dest + '');
    }, {
        onEnd: function () {
            return kit.outputJson(hashMapPath, map);
        }
    });
}

export default (opts) => {
    kit.require('url');

    let regCDN = /(\\?['"\(])([^'"\(]+?__CDN__[^'"\)]*?)(\\?['"\)])/g;
    let drives = kit.require('drives');

    let compileCDN = (hashMap) => {
        return kit.warp(`${assetJsPath}/**/*.js`)
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
        .run(assetJsPath);
    };

    let compileTpl = (hashMap) => {
        let list = kit.globSync(`${srcJsPagePath}/**/*.js`);
        list.forEach((path) => {
            let name = kit.path.basename(path, '.js');
            let tpl = require(pageDevPath)({
                vendor: opts.cdnPrefix + '/' + hashMap['asset/js/page/vendor.min.js'],
                page: opts.cdnPrefix + '/' + hashMap[`asset/js/page/${name}.min.js`]
            });
            kit.outputFileSync(`${assetPath}/${name}.html`, tpl);
        });
    };

    return kit.warp(`${assetPath}/**`)
    .load(drives.reader({ isCache: false, encoding: null }))
    .load(hashSuffix(hashMapPath))
    .run(assetPath)
    .then(() => {
        return kit.readJson(hashMapPath);
    }).then(async (hashMap) =>
        await * [compileCDN(hashMap), compileTpl(hashMap)]
    );
};
