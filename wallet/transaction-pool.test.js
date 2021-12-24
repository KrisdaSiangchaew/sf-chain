const TransactionPool = require('./transaction-pool')
const Transaction = require('./transaction')
const Wallet = require('./index')

describe('TransactionPool', () => {
    let tp, transaction, wallet

    beforeEach(() => {
        tp = new TransactionPool()
        wallet = new Wallet()
        transaction = Transaction.newTransaction(wallet, 'r4nd-4ddr355', 30)
        tp.updateOrAddTransaction(transaction)
    })

    it('adds a transaction to the pool', () => {
        expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction)
    })

    it('updates a new transaction to the pool', () => {
        let newTransaction = Transaction.newTransaction(wallet, 'foo-4ddr355', 20)
        tp.updateOrAddTransaction(newTransaction)

        let oldTransaction = JSON.stringify(transaction)

        expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id)))
        .not.toEqual(oldTransaction)
    })
})