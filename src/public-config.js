// 这里是全部对外的路径规则

import kit from 'nokit';

let { _ } = kit;

let cwd = process.cwd();
let packageJson = kit.readJsonSync(`${cwd}/package.json`);
let config = _.cloneDeep(packageJson['mx-fe-bone']);

_.each(config.paths, (v, k) => {
    config.paths[k] = `${cwd}/${v}`;
});

export default config;
