package com.moneymap.finance;

import com.moneymap.common.OwnedEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budgets", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "category"}))
public class Budget extends OwnedEntity {

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    public String category;

    // "limit" is a reserved word in SQL, so the column is called monthly_limit
    @NotNull(message = "Limit is required")
    @DecimalMin(value = "0.01", message = "Limit must be greater than 0")
    @Column(name = "monthly_limit", nullable = false, precision = 14, scale = 2)
    public BigDecimal limit;
}
