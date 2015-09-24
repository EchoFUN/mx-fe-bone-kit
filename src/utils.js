import kit from 'nokit';

let br = kit.require('brush');

export default {
    accessLog: name => ($) => {
        kit.logs(br.grey(`${name} ${$.req.url}`));
        return $.next();
    },

    checkPort (port) {
        if (!/^\d+$/.test(port))
            throw new Error(br.red(`invalid port: ${port}`));
    }
};
