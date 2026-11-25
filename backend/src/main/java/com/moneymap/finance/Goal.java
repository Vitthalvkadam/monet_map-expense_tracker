package com.moneymap.finance;

import com.moneymap.common.OwnedEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "goals")
public class Goal extends OwnedEntity {

    @NotBlank(message = "Goal name is required")
    @Size(max = 40, message = "Goal name is too long")
    @Column(nullable = false, length = 40)
    public String name;

    @NotNull(message = "Target is required")
    @DecimalMin(value = "0.01", message = "Target must be greater than 0")
    @Column(nullable = false, precision = 14, scale = 2)
    public BigDecimal target;

    // Only changed through the /contribute endpoint
    @Column(nullable = false, precision = 14, scale = 2)
    public BigDecimal saved = BigDecimal.ZERO;

    public LocalDate deadline;

    @NotBlank(message = "Colour is required")
    @Column(nullable = false, length = 20)
    public String color;
}
