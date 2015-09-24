import kit from 'nokit';

let br = kit.require('brush');
let cwd = process.cwd();

export default {
    accessLog: name => ($) => {
        kit.logs(br.grey(`${name} ${$.req.url}`));
        return $.next();
    },

    async requireEtc (name, opts) {
        try {
            await require(`${cwd}/etc/${name}`)(opts);
            kit.logs(`load module "etc/${name}"`);
        } catch (err) {
            kit.logs(br.yellow(`skip module "etc/${name}"`));
        }
    },

    checkPort (port) {
        if (!/^\d+$/.test(port))
            throw new Error(br.red(`invalid port: ${port}`));
    }
};
