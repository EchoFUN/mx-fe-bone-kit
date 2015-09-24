import kit from 'nokit';
let br = kit.require('brush');
let _ = kit._;

export default async (opts) => {
    let exec = kit.promisify(require('child_process').exec);
    let packInfo = require('./package.json');
    let url;

    try {
        url = await exec('git config --get remote.origin.url');
    } catch (err) {
        kit.err(br.red('请确保你已经正确设置 git remote'));
    }

    url = url.trim();

    if (!_.endsWith(_.trimRight(url, '.git'), packInfo.name)) {
        return kit.err('请保持 git 仓库名和 package.json 中得 name 一致');
    }

    return kit.request({
        method: 'POST',
        url: opts.testHost + '/deploy',
        resPipe: process.stdout,
        reqData: JSON.stringify({
            name: packInfo.name,
            branch: opts.testBranch,
            gitUrl: url
        })
    });
};
