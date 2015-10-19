import kit from 'nokit';

export default (proxyPort) => {
    let time = new Date().getTime();
    let host = '127.0.0.1';
    let pacPath = `http://${host}:${proxyPort}/pac?_${time}`;
    return kit.exec(`echo "kino" | sudo -S networksetup -setautoproxyurl Wi-Fi '${pacPath}'`);
};