import kit from 'nokit';
import config from './public-config';

let {
    webpackConfig, srcPage,
    packageJson, mock
} = config.paths;

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
    await kit.spawn('sudo', ['-v']);


    kit.monitorApp({
        bin: 'babel-node',
        args: [require.resolve('./dev-server'), opts],
        watchList: [kit.path.dirname(mock) + '/**/*.js']
    });

    await kit.sleep(1000);

    runWebpack();
    kit.watchFiles(
        [webpackConfig, packageJson],
        { handler: runWebpack }
    );
    kit.watchDir(srcPage, {
        patterns: '*.js',
        handler: (type) => {
            if (type === 'modify') { return; }
            runWebpack();
        }
    });
};
