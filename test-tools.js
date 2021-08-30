const express = require('express');
require('dotenv').config();
const bitcoin = require('bitcoinjs-lib'); // v4.x.x
const bitcoinMessage = require('bitcoinjs-message');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    testRun();
    res.send('Hello World!');
});

function testRun() {
    console.log('--------------- test-tools ------------------------');
    // wallet address: 
    var address = process.env.WALLET_ADDRESS;
    console.log('address="' + address + '"');
    var privateKeyWif = process.env.PRIVATE_KEY_WIF;
    console.log('privateKeyWif="' + privateKeyWif + '"');

    var keyPair = bitcoin.ECPair.fromWIF(privateKeyWif, bitcoin.networks.testnet);
    privateKey = keyPair.privateKey;
    var message = 'mp427WsAiYGbgdYLMUj4FmAUXFpBsVRvnW:1630338530:starRegistry';

    var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
    // var signature = bitcoinMessage.sign(message, privateKey, false);
    console.log('signature=' + signature.toString('base64'));
    console.log('bitcoinMessage=' + bitcoinMessage.verify(message, address, signature))
    console.log('---------------------------------------------------');
}
app.listen(port, () => {
    testRun();
    process.exit(1);

    console.log(`listening at http://localhost:${port}`);
});