const express = require('express');
require('dotenv').config();
const bitcoin = require('bitcoinjs-lib'); // v4.x.x
const bitcoinMessage = require('bitcoinjs-message');
const { createLogger, format, transports } = require('winston');
const app = express();
const port = 3000;

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.label({ label: 'test-tools' }),
        format.timestamp({
            format: 'YYYYMMDD,HHmmss.SSS'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.printf(({ level, message, label, timestamp }) => {
            return `${timestamp}:[${label}]:${level}: ${message}`;
        })
    ),
    defaultMeta: { service: 'test-tools' },
    transports: [
        new transports.Console()
    ]
});

app.get('/', (req, res) => {
    testRun();
    res.send('Hello World!');
});

function testRun() {
    logger.info('--------------- test-tools ------------------------');
    // wallet address: 
    var address = process.env.WALLET_ADDRESS;
    logger.info('address="' + address + '"');
    var privateKeyWif = process.env.PRIVATE_KEY_WIF;
    logger.info('privateKeyWif="' + privateKeyWif + '"');

    var keyPair = bitcoin.ECPair.fromWIF(privateKeyWif, bitcoin.networks.testnet);
    privateKey = keyPair.privateKey;
    var message = 'mp427WsAiYGbgdYLMUj4FmAUXFpBsVRvnW:1630338530:starRegistry';

    var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
    // var signature = bitcoinMessage.sign(message, privateKey, false);
    logger.info('signature=' + signature.toString('base64'));
    logger.info('bitcoinMessage=' + bitcoinMessage.verify(message, address, signature))
    logger.info('---------------------------------------------------');
}
app.listen(port, () => {
    testRun();
    process.exit(1);

    logger.info(`listening at http://localhost:${port}`);
});