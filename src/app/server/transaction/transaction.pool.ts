import { Transaction } from './transaction';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionPool {
    public transactions: Transaction[];

    constructor() {
        this.transactions = [];
    }

    public updateOrAddTransaction(newTransaction: Transaction){
        const transaction = this.transactions.find(t => t.id === newTransaction.id);

        if (transaction) {
            this.transactions[this.transactions.indexOf(transaction)] = newTransaction;
        } else {
            this.transactions.push(newTransaction);
        }
    }

    public find(address: string) {
        return this.transactions.find(t => t.input.address === address);
    }

    public validTransactions() {
        return this.transactions.filter(transaction => {
            const outputTotal = transaction.outputs.reduce((total, output) => {
                return Number(total) + Number(output.amount);
            }, 0);

            if (transaction.input.amount !== outputTotal ) {
                console.warn(`Invalid transaction from ${transaction.input.address.substring(0, 10)}...`);
                return;
            }

            if (!Transaction.verify(transaction)) {
                console.warn(`Invalid signature from ${transaction.input.address.substring(0, 10)}...`);
                return;
            }

            return transaction;
        });
    }

    public clear() {
        this.transactions = [];
    }

}