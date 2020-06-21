/*@flow*/
const Http = require('http');
const Querystring = require('querystring');

const Minimist = require('minimist');
const RpcClient = require('bitcoind-rpc');
const nThen = require('nthen');

const Config = require('./config.js');

/*::
export type Rpc_Config_t = {
    protocol: "http"|"https",
    user: string,
    pass: string,
    host: string,
    port: number,
    rejectUnauthorized: ?bool
};
*/

// TODO ?
const validArgs = (args, cmd) => true;
const getArgs = (cmd) => {
    return ``;
};

const query = (ctx, cmd, args, cb) => {
    ctx.rpc.batch(() => {
        ctx.rpc.batchedCalls = {
            jsonrpc: "1.0",
            id: "pktutil",
            method: cmd,
            params: args
        };
    }, cb);
};

const mempool = (ctx, _args, then) => {
    query(ctx, 'getrawmempool', [], (err, ret) => {
        //console.log(err, ret);
        if (!err && ret.error) { err = ret.error; }
        if (err) {
            return void then(err);
        } else {
            return void then(null, `Transactions in mempool:\n` +
                ret.result.map((x)=>`* [${x}](https://explorer.pkt.cash/tx/${x})`).join('\n'));
        }
    });
};
const diff = (ctx, _args, then) => {
    ctx.rpc.getInfo((err, ret) => {
        //console.log(err, ret);
        if (!err && ret.error) { err = ret.error; }
        if (err) {
            return void then(err);
        } else {
            return void then(null, `Current difficulty: ${Math.floor(ret.result.difficulty)}`);
        }
    });
};
const height = (ctx, _args, then) => {
    ctx.rpc.getInfo((err, ret) => {
        //console.log(err, ret);
        if (!err && ret.error) { err = ret.error; }
        if (err) {
            return void then(err);
        } else {
            return void then(null, `Current block height: ${Math.floor(ret.result.blocks)}`);
        }
    });
};

let COMMANDS = {};
const help = (ctx, _args, then) => {
    then(null, `Available commands:\n` + Object.keys(COMMANDS).map((cname) => (
        `* **/${ctx.cfg.trigger} ${cname}**  -  ${getArgs(COMMANDS[cname])} ${COMMANDS[cname].help}`
    )).join('\n') + `\nTo have the response written to the channel you're in, use \`--noisy\` flag.`);
};
COMMANDS = {
    diff:    { cmd: diff,    args: {}, help: 'Get the current PKT difficulty' },
    mempool: { cmd: mempool, args: {}, help: 'Show transactions which are currently in the mempool' },
    height:  { cmd: height,  args: {}, help: 'Get the current block height' },
    help:    { cmd: help,    args: {}, help: 'Print this message' },
};

const main = (cfg) => {
    const ctx = Object.freeze({
        cfg: Config,
        rpc: new RpcClient(Config.pktd),
    });
    Http.createServer((req, res) => {
        console.log('hit ' + req.url);
        const data = [];
        req.on('data', (d) => data.push(d));
        req.on('end', () => {
            const q = Querystring.parse(data.join(''));
            //console.log(q);
            const args = Minimist(q.text.split(' '), {
                boolean: 'noisy',
            });
            const cmd = args._[0] || 'help';

            const resp = {
                response_type: undefined, // default is ephimeral message
                text: `I don't understand the command ${cmd}, use "/${ctx.cfg.trigger} help" for more information`,
                // goto_location: "https://redirect.them.here",
                // username: "my username",
                // icon_url: "https://www.mattermost.org/wp-content/uploads/2016/04/icon.png",
            };
            if (args.noisy) { resp.response_type = 'in_channel'; }

            const command = COMMANDS[cmd];
            nThen((w) => {
                if (!command) { return; }
                if (!validArgs(args, cmd)) {
                    resp.text = `Invalid arguments, the ${cmd} command expects: ${getArgs(cmd)}`;
                    return;
                }
                command.cmd(ctx, args, w((err, ret) => {
                    if (err) {
                        resp.text = `Error: ${err}`;
                    } else {
                        resp.text = ret;
                    }
                    if (args.noisy) {
                        resp.text = `@${q.user_name}: \`/${ctx.cfg.trigger} ${q.text}\`\n` + resp.text;
                    }
                }));
            }).nThen((w) => {
                //console.log(JSON.stringify(resp));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(resp));
            });
        });
    }).listen(cfg.httpPort);
};
main(Config);