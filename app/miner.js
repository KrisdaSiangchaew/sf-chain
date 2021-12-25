const Wallet = require('../wallet')
const Transaction = require('../wallet/transaction')

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain
        this.transactionPool = transactionPool
        this.wallet = wallet
        this.p2pServer = p2pServer
    }

    mine() {
        // include a reward for the miner
        const validTransactions = this.transactionPool.validTransactions()
        validTransactions.push(
            Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
        )
        // create a block consisting of valid transactions
        const block = this.blockchain.addBlock(validTransactions)
        // synchronize the chains in the p2p server
        this.p2pServer.syncChains()
        // clear the transactions pool
        this.transactionPool.clear()
        // broadcast to every miners to clear their transaction pool
        this.p2pServer.broadcastClearTransactions()

        return block
    }
}

module.exports = Miner