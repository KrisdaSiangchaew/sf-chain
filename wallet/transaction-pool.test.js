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

    describe('mixing valid and corrupt transactions', () => {
        let validTransactions

        beforeEach(() => {
            validTransactions = [...tp.transactions]
            for (let i=0; i<6; i++) {
                wallet = new Wallet()
                transaction = wallet.createTransaction('r4nd-4ddr355', 30, tp)
                if (i%2 == 0) {
                    transaction.input.amount = 9999
                } else {
                    validTransactions.push(transaction)
                }
            }
        })

        it('shows a difference between valid and corrupt transactions', () => {
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions))
        })

        it('grabs valid transactions', () => {
            expect(tp.validTransactions()).toEqual(validTransactions)
        })

        it('clears the transactions', () => {
            tp.clear()
            expect(tp.transactions).toEqual([])
        })
    })
})