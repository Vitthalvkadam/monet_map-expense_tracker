package com.moneymap.finance;

import com.moneymap.common.OwnedController;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController extends OwnedController<Subscription> {

    public record PayResult(Subscription subscription, Transaction transaction) {}

    private final TransactionRepository transactions;

    public SubscriptionController(SubscriptionRepository repo, TransactionRepository transactions) {
        super(repo);
        this.transactions = transactions;
    }

    @Override
    protected void copy(Subscription from, Subscription to) {
        to.name = from.name;
        to.amount = from.amount;
        to.cycle = from.cycle;
        to.nextDate = from.nextDate;
        to.active = from.active;
    }

    @PostMapping("/{id}/toggle")
    @Transactional
    public Subscription toggle(@PathVariable UUID id) {
        Subscription sub = find(id);
        sub.active = !sub.active;
        return sub;
    }

    /** Logs the payment as an expense and moves the next payment date forward. */
    @PostMapping("/{id}/pay")
    @Transactional
    public PayResult pay(@PathVariable UUID id) {
        Subscription sub = find(id);

        Transaction payment = new Transaction();
        payment.userId = sub.userId;
        payment.type = "expense";
        payment.category = "Bills";
        payment.amount = sub.amount;
        payment.date = LocalDate.now();
        payment.description = sub.name + " subscription";
        transactions.save(payment);

        sub.nextDate = sub.nextDate.plusMonths("monthly".equals(sub.cycle) ? 1 : 12);
        return new PayResult(sub, payment);
    }
}
