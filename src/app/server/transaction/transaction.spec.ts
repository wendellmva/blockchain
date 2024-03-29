import { Transaction } from './transaction';
import { Wallet } from '../wallet';
import { MINING_REWARD } from '../config';

describe('Transaction', () => {
    let transaction: Transaction;
    let wallet: Wallet;
    let recipient: string;
    let amount: number;

    beforeEach(() => {
        wallet = new Wallet();
        recipient = 'rec1p13nt';
        amount = 50;
        transaction = Transaction.newTransaction(wallet, recipient, amount );
    });

    it('should output `amount` deducted from wallet balance', () => {
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
            .toEqual(wallet.balance - amount);
    });

    it('should output `amount` added to recipient', () => {
        expect(transaction.outputs.find(output => output.address === recipient).amount)
            .toEqual(amount);
    });

    it('should input wallet `balance`', () => {
        expect(transaction.input.amount).toEqual(wallet.balance);
    });

    it('should accept valid transaction', () => {
        expect(Transaction.verify(transaction)).toBe(true);
    });

    it('should reject invalid transaction', () => {
        transaction.outputs[0].amount = 500000;
        expect(Transaction.verify(transaction)).toBe(false);
    });

    describe('exceeds wallet balance', () => {

        beforeEach(() => {
            amount = 50000;
            transaction = Transaction.newTransaction(wallet, recipient, amount );
        });

        it('should not occur ', () => {
            expect(transaction).toEqual(undefined);
        });

    });

    describe('updates with next transaction', () => {
        let nextAmount: number;
        let nextRecipient: string;

        beforeEach(() => {
            nextAmount = 20;
            nextRecipient = 'n3xt-4ddr355';
            transaction = transaction.update(wallet, nextRecipient, nextAmount );
        });

        it('should deduct next amount from senders output', () => {
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(wallet.balance - amount - nextAmount);
        });

        it('should output amount for next recipient', () => {
            expect(transaction.outputs.find(output => output.address === nextRecipient).amount)
                .toEqual(nextAmount);
        });
    });

    describe('creates reward transaction', () => {
        beforeEach(() => {
            transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
        });

        it(`should reward miner's wallet`, () => {
            expect(transaction.outputs
                .find(output => output.address === wallet.publicKey).amount)
                .toEqual(MINING_REWARD);
        });

    });
});

// describe('', () => {});
// beforeEach(() => {});
// it('', () => {});