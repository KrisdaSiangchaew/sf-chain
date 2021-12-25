const Transaction = require("./transaction")

class TransactionPool {
    constructor() {
        this.transactions = []
    }

    updateOrAddTransaction(transaction) {
        let transactionWithId = this.transactions.find(t => t.id === this.transactions.id)

        if (transactionWithId) {
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction
        } else {
            this.transactions.push(transaction)
        }
    }

    existingTransaction(address) {
        return this.transactions.find( t => t.input.address === address)
    }

    validTransactions() {
        // check that the total output amount equals the available amount
        return this.transactions.filter(transaction => {
            const outputTotal = transaction.outputs.reduce((total, output) => {
                return total + output.amount
            }, 0)

            if (outputTotal !== transaction.input.amount) {
                console.log(`Invalid transaction from ${transaction.input.address}.`)
                return
            }
            
            if (!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.input.address}.`)
                return
            }

            return transaction
        })
    }
}

module.exports = TransactionPool