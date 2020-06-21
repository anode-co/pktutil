module.exports = Object.freeze({
    trigger: 'pkt',
    pktd: {
        protocol: "https",
        user: 'your_pktd_username_see_pktd.conf',
        pass: 'your_pktd_password_see_pktd.conf',
        host: "localhost",
        port: 64765,
        rejectUnauthorized: false
    },
    httpPort: 9999,
});