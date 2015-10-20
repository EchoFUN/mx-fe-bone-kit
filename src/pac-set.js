import kit from 'nokit';

export default {
    on: async (opts) => {
        let time = new Date().getTime();
        let host = '127.0.0.1';
        let pacPath = `http://${host}:${opts.transPort}/pac?_${time}`;
        try {
            await kit.spawn('sudo' , ['networksetup', '-setautoproxyurl', opts.ethernet, `${pacPath}`]);
        } catch (err){
            //
        }
    },
    off: async (opts) => {
        await kit.spawn('sudo' , ['networksetup', '-setautoproxystate', opts.ethernet, 'off']);
    }
};