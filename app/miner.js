class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain
        this.transactionPool = transactionPool
        this.wallet = wallet
        this.p2pServer = p2pServer
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions()
        // include a reward for the miner
        // create a block consisting of valid transactions
        // synchronize the chains in the p2p server
        // clear the transactions pool
        // broadcast to every miners to clear their transaction pool
    }
}

module.exports = Miner