# S8: Transaction Pool

# 1. Transaction Pool - Add Transaction
A transaction pool will collect all transactions submitted by individuals in the cryptocurrency network. Then, miners will do the work of taking transactions from the pool and including them in the blockchain. Create the transaction pool in the wallet directory with a file called transaction-pool.js:
```
class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {
    let transactionWithId = this.transactions.find(t => t.id === transaction.id);
    if (transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
    } else {
      this.transactions.push(transaction);
    }
  }
}

module.exports = TransactionPool;
```

The `updateOrAddTransaction` method by default will add an incoming transaction to the transactions array. However, there is the possibility that a transaction could come in that already exists in the array. Why? Recall that there is the ability to update transactions to have additional outputs. This means that a transaction could exist in the pool. However, if it gets updated, and is resubmitted to the pool, that transaction shouldn’t appear twice.

# 2. Test Transaction Pool
Test the Transaction Pool in a file called transaction-pool.test.js alongside
the transaction-pool.js file.
- Create transaction-pool.test.js
```
const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');

describe('TransactionPool', () => {
  let tp, wallet, transaction;
  beforeEach(() => {
    tp = new TransactionPool();
    wallet = new Wallet();
    transaction = Transaction.newTransaction(wallet, 'r4nd-4dr355', 30);
    tp.updateOrAddTransaction(transaction);
  });

  it('adds a transaction to the pool', () => {
    expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
  });

  it('updates a transaction in the pool', () => {
    const oldTransaction = JSON.stringify(transaction);
    const newTransaction = transaction.update(wallet, 'foo-4ddr355', 40);
    tp.updateOrAddTransaction(newTransaction);
    expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id)))
      .not.toEqual(oldTransaction);
  });
});
```
```
$ npm run test
```

# 3.




