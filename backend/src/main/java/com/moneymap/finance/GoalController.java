package com.moneymap.finance;

import com.moneymap.common.OwnedController;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
public class GoalController extends OwnedController<Goal> {

    public record ContributeRequest(
            @NotNull(message = "Amount is required")
            @DecimalMin(value = "0.01", message = "Amount must be greater than 0") BigDecimal amount) {}

    public GoalController(GoalRepository repo) {
        super(repo);
    }

    @Override
    protected void copy(Goal from, Goal to) {
        to.name = from.name;
        to.target = from.target;
        to.deadline = from.deadline;
        to.color = from.color;
    }

    @Override
    protected void beforeCreate(Goal goal) {
        goal.saved = BigDecimal.ZERO;
    }

    @PostMapping("/{id}/contribute")
    @Transactional
    public Goal contribute(@PathVariable UUID id, @Valid @RequestBody ContributeRequest req) {
        Goal goal = find(id);
        goal.saved = goal.saved.add(req.amount());
        return goal;
    }
}
