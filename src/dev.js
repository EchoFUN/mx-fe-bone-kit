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
    // Get sudo permission
    if (!opts.interactionOff)
        await kit.spawn('sudo', ['-p', '请输入 sudo 密码: ', '-v']);

    process.env['mx-fe-bone-opts'] = JSON.stringify(opts);

    kit.monitorApp({
        bin: 'babel-node',
        args: [require.resolve('./dev-server'), opts],
        watchList: [kit.path.dirname(opts.mock) + '/**/*.js']
    });

    await kit.sleep(1000);

    runWebpack();
    kit.watchFiles(
        ['webpack.config.js', 'package.json'],
        { handler: runWebpack }
    );
    kit.watchDir(opts.srcPage, {
        patterns: '*.js',
        handler: (type) => {
            if (type === 'modify') { return; }
            runWebpack();
        }
    });
};
