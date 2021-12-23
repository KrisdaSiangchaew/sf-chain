const Transaction = require('./transaction')
const Wallet = require('./index')
const { intFromLE } = require('elliptic/lib/elliptic/utils')

describe('Transaction', () => {
    let transaction, wallet, recipient, amount

    beforeEach(() => {
        wallet = new Wallet()
        amount = 50
        recipient = 'r3c1p13nt'
        transaction = Transaction.newTransaction(wallet, recipient, amount)
    })

    it('outputs the `amount` subtracted from the wallet balance', () => {
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
        .toEqual(wallet.balance - amount)
    })

    it('outputs the `amount` added to recipient', () => {
        expect(transaction.outputs.find(output => output.address === recipient).amount)
        .toEqual(amount)
    })

    it('inputs the balance of the wallet', () => {
        expect(transaction.input.amount).toEqual(wallet.balance)
    })
})

describe('transacting with an amount that exceeds the balance', () => {
    let transaction, wallet, recipient, amount

    beforeEach(() => {
        wallet = new Wallet()
        amount = 50000
        recipient = 'r3c1p13nt'
        transaction = Transaction.newTransaction(wallet, recipient, amount)
    })

    it('does not create transaction', () => {
        expect(transaction).toEqual(undefined)
    })
})