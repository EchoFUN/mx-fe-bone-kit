import kit from 'nokit';

let br = kit.require('brush');

let webpack;

function runWebpack () {
    kit.logs(br.cyan('reload webpack'));
    if (webpack) { webpack.kill(); }
    webpack = kit.spawn(
        'webpack', ['--watch', '--progress', '--colors']
    ).process;
}

export default (opts) => {
    kit.monitorApp({
        bin: 'babel-node',
        args: ['kit/dev-server.js', kit._.pick(
            opts,
            ['port', 'proxyPort', 'proxyHost']
        )],
        watchList: ['kit/**/*.js', 'etc/**/*.js', 'page/**/*.js']
    });

    runWebpack();
    kit.watchFiles(
        ['webpack.config.js', 'kit/**/*.js'],
        { handler: runWebpack }
    );
    kit.watchDir('src/js/page', {
        patterns: '*.js',
        handler: (type) => {
            if (type === 'modify') { return; }
            runWebpack();
        }
    });
};
