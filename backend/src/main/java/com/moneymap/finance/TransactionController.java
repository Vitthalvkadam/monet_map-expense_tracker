package com.moneymap.finance;

import com.moneymap.common.OwnedController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController extends OwnedController<Transaction> {

    public TransactionController(TransactionRepository repo) {
        super(repo);
    }

    @Override
    protected void copy(Transaction from, Transaction to) {
        to.type = from.type;
        to.amount = from.amount;
        to.category = from.category;
        to.description = from.description;
        to.date = from.date;
    }
}
