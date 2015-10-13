import kit from 'nokit';
import config from './public-config';

let {
    webpackConfigPath, srcPagePath,
    packageJsonPath, mockPath
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
    kit.monitorApp({
        bin: 'babel-node',
        args: [require.resolve('./dev-server'), kit._.pick(
            opts,
            opts.options.map(o => o.long.slice(2))
        )],
        watchList: [kit.path.dirname(mockPath) + '/**/*.js']
    });

    await kit.sleep(1000);

    runWebpack();
    kit.watchFiles(
        [webpackConfigPath, packageJsonPath],
        { handler: runWebpack }
    );
    kit.watchDir(srcPagePath, {
        patterns: '*.js',
        handler: (type) => {
            if (type === 'modify') { return; }
            runWebpack();
        }
    });
};
