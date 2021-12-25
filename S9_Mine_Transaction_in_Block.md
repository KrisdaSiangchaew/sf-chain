# 1. Create Miner Class
Create a Miner class to tie all the concepts together. Create app/miner.js:

```
class Miner {
  constructor(blockchain, transactionPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  mine() {
    const validTransactions = this.transactionPool.validTransactions();
    // include a reward transaction for the miner
    // create a block consisting of the valid transactions
    // synchronize chains in the peer-to-peer server
    // clear the transaction pool
    // broadcast to every miner to clear their transaction pools
  }
}

module.exports = Miner;
```
# 2. Grab Valid Transactions
The first step to writing the mine function that we have in the Miner class is to add a validTransactions function for the TransactionPool. With this validTransactions function, return any transaction within the array of transactions that meets the following conditions. First, its total output amount matches the original balance specified in the input amount. Second, we’ll also verify the signature of every transaction to make sure that the data has not been corrupted after it was sent by the original sender.  Add a function called validTransactions to transaction-pool.js:

```
validTransactions() {
  return this.transactions.filter(transaction => {
    const outputTotal = transaction.outputs.reduce((total, output) => {
      return total + output.amount;
    }, 0);
    
    if (transaction.input.amount !== outputTotal) {
      console.log(`Invalid transaction from ${transaction.input.address}.`);
      return;
    }

    if (!Transaction.verifyTransaction(transaction)) {
      console.log(`Invalid signature from ${transaction.input.address}.`)
      return;
    };
    
    return transaction;
  });
}
```

Note that there is a dependency though on the Transaction class. So import the Transaction class at the top of the file:
```
const Transaction = require('../wallet/transaction');
```
# 3. Test Valid Transactions
Test the validTransactions function with transaction-pool.test.js. There is actually a feature that can shorten down on the number of lines. Recall that there is a function within the wallet class create a transaction based on a given address, amount, and transaction pool. The createTransaction also does the job of adding the created transaction to the pool. This is what is already done manually by creating the transaction and adding it to the pool. So we can reduce this with one call to wallet.createTransaction, and the same random address, amount, and tp transaction pool instance:
```
   // remove → transaction = Transaction.newTransaction(wallet, 'r4nd-4dr355', 30);
   // remove → tp.updateOrAddTransaction(transaction);
   transaction = wallet.createTransaction('r4nd-4dr355', 30, bc, tp);
```

To begin testing the validTransactions functionality, create a situation where there is a mix of valid and corrupt transactions. Capture the scenario with a new describe block:
```
describe('mixing valid and corrupt transactions', () => {
  let validTransactions;
  beforeEach(() => {
    validTransactions = [...tp.transactions];
    for (let i=0; i<6; i++) {
      wallet = new Wallet();
      transaction = wallet.createTransaction('r4nd-4dr355', 30, tp);
      if (i%2==0) {
        transaction.input.amount = 9999;
      } else {
        validTransactions.push(transaction);
      }
    }
  });

  it('shows a difference between valid and corrupt transactions', () => {
    expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
  });

  it('grabs valid transactions', () => {
    expect(tp.validTransactions()).toEqual(validTransactions);
  });
});
```
```
$ npm run test
```
# 4. Reward Transaction
Payment to miners for the act of mining.
Reward transaction needs only one output. It needs to specify the amount of currency 
Differences to the regular transaction
- Only one output to specify the amount paid to miners - no output necessary to specify resulting amount.
- Blockchain itself sign the transaction.

We then need a special wallet that will allow the blockchain itself to sign the transaction. To start, we define a constant to define how much currency miners will receive. The constant is defined in the config.js.
```
const MINING_REWARD = 50
...
module.exports = { DIFFICULTY, MINE_RATE, INITIAL_BALANCE, MINING_REWARD }
```
In transaction.js, reference the MINING_REWARD constant.
```
const { MINING_REWARD } = require('../config')
```
The code for the creation and signing of new transaction are already written. So we can refactor the existing code to support reward transaction. So we will create a helper function transactionWithOutput(senderWallet, outputs) by refactoring the newTransaction(senderWallet, recipient, amount)
```
   static transactionWithOuput(senderWallet, outputs) {
        const transaction = new this()
        transaction.outputs.push(...outputs)
        Transaction.signTransaction(transaction, senderWallet)
        return transaction
    }
```
The newTransaction function then leverges this new helper function.
```
    static newTransaction(senderWallet, recipient, amount) {
        if (amount > senderWallet.balance) {
            console.log(`Amount: ${amount} exceeds balance.`)
            return
        }

        return this.transactionWithOuput(senderWallet, [
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
            { amount: amount, address: recipient }
        ])
    }
```
We create a new rewardTransaction(minerWallet, blockchainWallet). A blockchain wallet is a special wallet that will generate signatures to confirm and authenticate reward transaction.
```
    static rewardTransaction(minerWallet, blockchainWallet) {
        return this.transactionWithOuput(blockchainWallet, [
            { amount: MINING_REWARD, address: minerWallet.publicKey}
        ])
    }
```
So now we need to create blockchain wallet. Go to wallet/index.js.
```
    static blockchainWallet() {
        const blockchainWallet = new this()
        blockchainWallet.address = 'blockchain-wallet'
        return blockchainWallet
    }
```
# 5. Test Reward Transactions
Add to transaction.test.js
```
describe('creating a reward transaction', () => {
        beforeEach(() => {
            transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet())
        })

        it(`rewards the miner's wallet`, () => {
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
            .toEqual(MINING_REWARD)
        })
    })
```

# 6. Reward Valid and Clear Transaction
Let's continue expanding the miner class with the ability to grab valid transactions. First we will push a reward transaction to the valid transaction array that we have in the pool. In the Miner class, add this.
```
const Wallet = require('../wallet')
const Transaction = require('../transaction')
...

mine() {
        // include a reward for the miner
        const validTransactions = this.transactionPool.validTransactions()
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()))
        // create a block consisting of valid transactions
        const block = this.blockchain.addBlock(validTransactions)
        // synchronize the chains in the p2p server
        this.p2pServer.syncChain()
        // clear the transactions pool
        this.transactionPool.clear()
        // broadcast to every miners to clear their transaction pool
        
    }
```

Clear out the transaction pool. Go to wallet/transaction-pool.js and add this.
```
clear() {
        this.transactions = []
    }
```

# 7. Broadcast Clear Transactions
We enable this by adding to app/p2p-server.js the following.
```
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTIONS',
    clear_transactions: 'CLEAR_TRANSACTIONS'
}
...
messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message)
            switch (data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain)
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction)
                    break
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear()
                    break
            }
            
        })
    }
...
broadcastClearTransaction() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })))
    }
```
Then update the miner.js with the following. We return the block at the very end to let other class use it.
```
mine() {
        // include a reward for the miner
        const validTransactions = this.transactionPool.validTransactions()
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()))
        // create a block consisting of valid transactions
        const block = this.blockchain.addBlock(validTransactions)
        // synchronize the chains in the p2p server
        this.p2pServer.syncChain()
        // clear the transactions pool
        this.transactionPool.clear()
        // broadcast to every miners to clear their transaction pool
        this.p2pServer.broadcastClearTransactions()

        return block
    }
```

# 8. Mine Transaction Endpoint
Update made to app/index.js. Add constant Miner class and make instance out of it.
```
const Miner = require('./miner')
...
const miner = new Miner(bc, tp, wallet, p2pServer)
```
```
app.get('/mine-transactions', (req, res) => {
    const block = miner.mine()
    console.log(`New block added: ${block.toString()}`)
    res.walletredirect('/block')
})
```


