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

# 3. Create Transaction with Wallet
Create transactions with the Wallet class. Define a new method within the Wallet class called createTransaction with three parameters, a recipient, the amount for the transaction, and a transactionPool object. The function will assume an `existingTransaction` function exists for the transactionPool, to help replace existing transactions in the pool:

In wallet/index.js:
```
createTransaction(recipient, amount, transactionPool) {
  if (amount > this.balance) {
    console.log(`Amount: ${amount}, exceeds current balance: ${this.balance}`);
    return;
  }

  let transaction = transactionPool.existingTransaction(this.publicKey);
  if (transaction) {
    transaction.update(this, recipient, amount);
  } else {
    transaction = Transaction.newTransaction(this, recipient, amount);
    transactionPool.updateOrAddTransaction(transaction);
  }

  return transaction;
}
```

Make sure to import the Transaction class in wallet/index.js
```
const Transaction = require('./transaction');
```

Add the existingTransaction function to transaction-pool.js:
```
  existingTransaction(address) {
    return this.transactions.find(transaction => transaction.input.address === address);
  }
```

# 4. Test Wallet Transactions
Test wallet transactions.
- Create wallet/index.test.js
```
const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');

describe('Wallet', () => {
  let wallet, tp;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
  });

  describe('creating a transaction', () => {
    let transaction, sendAmount, recipient;
    beforeEach(() => {
      sendAmount = 50;
      recipient = 'r4nd0m-4ddr3s';
      transaction = wallet.createTransaction(recipient, sendAmount, tp);
    });

    describe('and doing the same transaction', () => {
      beforeEach(() => {
        wallet.createTransaction(recipient, sendAmount, tp);
      });

      it('doubles the `sendAmount` subtracted from the wallet balance', () => {
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
        .toEqual(wallet.balance - sendAmount*2);
      });

      it('clones the `sendAmount` output for the recipient', () => {
        expect(transaction.outputs.filter(output => output.address === recipient)
          .map(output => output.amount)).toEqual([sendAmount, sendAmount]);
      });
    });
  });
});
```
```
$ npm run test
```

# 5. 






