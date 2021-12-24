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
}

module.exports = TransactionPool