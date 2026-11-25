package com.moneymap.finance;

import com.moneymap.common.CurrentUser;
import com.moneymap.user.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** One request to load everything after login, and one to wipe the user's data. */
@RestController
@RequestMapping("/api/data")
public class DataController {

    public record DataDto(List<Transaction> transactions, List<Budget> budgets, List<Goal> goals,
                          List<Subscription> subscriptions, SettingsController.SettingsDto settings) {}

    private final TransactionRepository transactions;
    private final BudgetRepository budgets;
    private final GoalRepository goals;
    private final SubscriptionRepository subscriptions;
    private final UserRepository users;

    public DataController(TransactionRepository transactions, BudgetRepository budgets, GoalRepository goals,
                          SubscriptionRepository subscriptions, UserRepository users) {
        this.transactions = transactions;
        this.budgets = budgets;
        this.goals = goals;
        this.subscriptions = subscriptions;
        this.users = users;
    }

    @GetMapping
    public DataDto all() {
        UUID id = CurrentUser.id();
        var user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
        return new DataDto(
                transactions.findByUserIdOrderByCreatedAtAsc(id),
                budgets.findByUserIdOrderByCreatedAtAsc(id),
                goals.findByUserIdOrderByCreatedAtAsc(id),
                subscriptions.findByUserIdOrderByCreatedAtAsc(id),
                SettingsController.toDto(user));
    }

    @DeleteMapping
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAll() {
        UUID id = CurrentUser.id();
        transactions.deleteByUserId(id);
        budgets.deleteByUserId(id);
        goals.deleteByUserId(id);
        subscriptions.deleteByUserId(id);
    }
}
