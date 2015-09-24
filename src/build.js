import kit from 'nokit';
let br = kit.require('brush');
let cwd = process.cwd();

export default (opts) => {
    kit.require('url');

    let reg = /(\\?['"\(])([^'"\(]+?__CDN__[^'"\)]*?)(\\?['"\)])/g;
    let hashMapPath = 'asset/hash-map.json';
    let drives = kit.require('drives');

    let compileCDN = (hashMap) => {
        return kit.warp('asset/js/**/*.js')
        .load(drives.reader({ isCache: false }))
        .load((f) => {
            f.set(f.contents.replace(reg, function (m, left, p, right) {
                p = kit.url.parse(p, true);
                delete p.search;
                delete p.query.__CDN__; // eslint-disable-line
                p.pathname = opts.cdnPrefix + '/' + hashMap[p.pathname.slice(1)];
                kit.logs(br.cyan('cdn:'), p.pathname);
                p = kit.url.format(p);
                return left + p + right;
            }));
        })
        .run('asset/js');
    };

    let compileTpl = (hashMap) => {
        let list = kit.globSync('src/js/page/*.js');
        list.forEach((path) => {
            let name = kit.path.basename(path, '.js');
            let tpl = require(`${cwd}/page/dev`)({
                vendor: opts.cdnPrefix + '/' + hashMap['asset/js/page/vendor.min.js'],
                page: opts.cdnPrefix + '/' + hashMap['asset/js/page/' + name + '.min.js']
            });
            kit.outputFileSync('asset/' + name + '.html', tpl);
        });
    };

    return kit.warp('asset/**/*')
    .load(drives.reader({ isCache: false, encoding: null }))
    .load(drives.hashSuffix(hashMapPath))
    .run('asset')
    .then(() => {
        return kit.readJson(hashMapPath);
    }).then(async (hashMap) =>
        await * [compileCDN(hashMap), compileTpl(hashMap)]
    );
};
