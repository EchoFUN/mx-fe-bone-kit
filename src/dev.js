import kit from 'nokit';
import { webpackConfigPath, srcJsPagePath, packageJsonPath } from './public-env';

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
        )]
    });

    await kit.sleep(1000);

    runWebpack();
    kit.watchFiles(
        [webpackConfigPath, packageJsonPath],
        { handler: runWebpack }
    );
    kit.watchDir(srcJsPagePath, {
        patterns: '*.js',
        handler: (type) => {
            if (type === 'modify') { return; }
            runWebpack();
        }
    });
};
