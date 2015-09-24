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

export default async (opts) => {
    kit.monitorApp({
        bin: 'babel-node',
        args: [require.resolve('./dev-server'), kit._.pick(
            opts,
            ['port', 'proxyPort', 'proxyHost']
        )],
        watchList: ['etc/**/*.js', 'page/**/*.js']
    });

    await kit.sleep(1000);

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
