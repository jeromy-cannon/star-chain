const { createLogger, format, transports } = require('winston');
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.label({ label: 'BlockchainController' }),
        format.timestamp({
            format: 'YYYYMMDD,HHmmss.SSS'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.colorize(),
        format.printf(({ level, message, label, timestamp, stack }) => {
            if (stack) return `${timestamp}:[${label}]:${level}: ${message} - ${stack}`;
            return `${timestamp}:[${label}]:${level}: ${message}`;
        })
    ),
    defaultMeta: { service: 'star-chain' },
    transports: [
        new transports.Console()
    ]
});
/**
 *          BlockchainController
 * 
 * This class expose the endpoints that the client applications will use to interact with the 
 * Blockchain dataset
 */
class BlockchainController {

    //The constructor receive the instance of the express.js app and the Blockchain class
    constructor(app, blockchainObj) {
        this.app = app;
        this.blockchain = blockchainObj;
        // All the endpoints methods needs to be called in the constructor to initialize the route.
        this.getBlockByHeight();
        this.requestOwnership();
        this.submitStar();
        this.getBlockByHash();
        this.getStarsByOwner();
        this.getChainErrorList();
    }

    // Enpoint to Get a Block by Height (GET Endpoint)
    getBlockByHeight() {
        this.app.get("/block/height/:height", async (req, res) => {
            if (req.params.height) {
                // logger.info('current blockchain height: ' + await this.blockchain.getChainHeight());
                const height = parseInt(req.params.height);
                let block = await this.blockchain.getBlockByHeight(height);
                if (block) {
                    return res.status(200).json(block);
                } else {
                    return res.status(404).send("Block Not Found!");
                }
            } else {
                return res.status(404).send("Block Not Found! Review the Parameters!");
            }

        });
    }

    // endpoint for getting a list of chain errors, or returns an empty array if none are found.
    getChainErrorList() {
        this.app.get("/chainErrorList", async (req, res) => {
            return res.status(200).json(await this.blockchain.validateChain().catch(error => {
                return res.status(500).send(error);
            }));
        });
    }

    // Endpoint that allows user to request Ownership of a Wallet address (POST Endpoint)
    // not sure why this is named as such, this just provides a message in the appropriate format
    // provided an address is given
    // <WALLET_ADRESS>:${new Date().getTime().toString().slice(0,-3)}:starRegistry;
    requestOwnership() {
        this.app.post("/requestValidation", async (req, res) => {
            //logger.info(req);
            logger.info('requestValidation > req.body=' + req.body);
            if (req.body.address) {
                const address = req.body.address;
                // logger.info('address: ', address);
                const message = await this.blockchain.requestMessageOwnershipVerification(address);
                if (message) {
                    // logger.info('message:', message);
                    return res.status(200).json(message);
                } else {
                    let errorMessage = 'Error: no message was created';
                    // logger.info(errorMessage);
                    return res.status(500).send(errorMessage);
                }
            } else {
                let errorMessage = "Check the Body Parameter! No address found.";
                // logger.info(errorMessage)
                return res.status(500).send(errorMessage);
            }
        });
    }

    // Endpoint that allow Submit a Star, you need first to `requestOwnership` to have the message (POST endpoint)
    // a bit weird, but the endpoint is called requestValidation, you give it the address, and it returns a message
    // you need that message as part of the request body of this call
    submitStar() {
        this.app.post("/submitstar", async (req, res) => {
            if (req.body.address && req.body.message && req.body.signature && req.body.star) {
                const address = req.body.address;
                const message = req.body.message;
                const signature = req.body.signature;
                const star = req.body.star;
                logger.info('submitstar > address: ' + address);
                logger.info('submitstar > message: ' + message);
                logger.info('submitstar > signature: ' + signature);
                logger.info('submitstar > star: ' + star);
                try {
                    let block = await this.blockchain.submitStar(address, message, signature, star);
                    if (block) {
                        return res.status(200).json(block);
                    } else {
                        return res.status(500).send("An error happened!");
                    }
                } catch (error) {
                    return res.status(500).send(error);
                }
            } else {
                return res.status(500).send("Check the Body Parameter!");
            }
        });
    }

    // This endpoint allows you to retrieve the block by hash (GET endpoint)
    getBlockByHash() {
        this.app.get("/block/hash/:hash", async (req, res) => {
            if (req.params.hash) {
                const hash = req.params.hash;
                logger.info('hash: ' + hash);
                let block = await this.blockchain.getBlockByHash(hash);
                if (block) {
                    return res.status(200).json(block);
                } else {
                    return res.status(404).send("Block Not Found!");
                }
            } else {
                return res.status(404).send("Block Not Found! Review the Parameters!");
            }

        });
    }

    // This endpoint allows you to request the list of Stars registered by an owner
    getStarsByOwner() {
        this.app.get("/blocks/:address", async (req, res) => {
            if (req.params.address) {
                const address = req.params.address;
                logger.info('address: ' + address);
                try {
                    let stars = await this.blockchain.getStarsByWalletAddress(address);
                    if (stars) {
                        return res.status(200).json(stars);
                    } else {
                        return res.status(404).send("Block Not Found!");
                    }
                } catch (error) {
                    return res.status(500).send("An error happened!");
                }
            } else {
                return res.status(500).send("Block Not Found! Review the Parameters!");
            }

        });
    }

}

// TODO: create postman test suite for: 2. get message, 3. sign message (manual?), 4. submit star, 5. verify timeout, 6. added to chain, 7. retrieve by owner, decoded

module.exports = (app, blockchainObj) => { return new BlockchainController(app, blockchainObj); }