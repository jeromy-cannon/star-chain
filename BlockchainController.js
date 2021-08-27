/**
 *          BlockchainController
 *       (Do not change this code)
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
    }

    // Enpoint to Get a Block by Height (GET Endpoint)
    getBlockByHeight() {
        this.app.get("/block/height/:height", async (req, res) => {
            if (req.params.height) {
                // console.log('current blockchain height: ' + await this.blockchain.getChainHeight());
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

    // Endpoint that allows user to request Ownership of a Wallet address (POST Endpoint)
    // TODO: requestOwnership endpoint
    requestOwnership() {
        this.app.post("/requestValidation", async (req, res) => {
            //console.log(req);
            console.log('requestValidation > req.body=', req.body);
            if (req.body.address) {
                const address = req.body.address;
                // console.log('address: ', address);
                const message = await this.blockchain.requestMessageOwnershipVerification(address);
                if (message) {
                    // console.log('message:', message);
                    return res.status(200).json(message);
                } else {
                    let errorMessage = 'Error: no message found in block';
                    // console.log(errorMessage);
                    return res.status(500).send(errorMessage);
                }
            } else {
                let errorMessage = "Check the Body Parameter! No address found.";
                // console.log(errorMessage)
                return res.status(500).send(errorMessage);
            }
        });
    }

    // Endpoint that allow Submit a Star, yu need first to `requestOwnership` to have the message (POST endpoint)
    // TODO: submitStar needs requestOwnership
    submitStar() {
        this.app.post("/submitstar", async (req, res) => {
            if (req.body.address && req.body.message && req.body.signature && req.body.star) {
                const address = req.body.address;
                const message = req.body.message;
                const signature = req.body.signature;
                const star = req.body.star;
                console.log('address: ', address);
                console.log('message: ', message);
                console.log('signature: ', signature);
                console.log('star: ', star);
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
                console.log('hash: ', hash);
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
                console.log('address: ', address);
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