package com.moneymap.finance;

import com.moneymap.common.OwnedController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController extends OwnedController<Budget> {

    public BudgetController(BudgetRepository repo) {
        super(repo);
    }

    @Override
    protected void copy(Budget from, Budget to) {
        to.category = from.category;
        to.limit = from.limit;
    }
}
