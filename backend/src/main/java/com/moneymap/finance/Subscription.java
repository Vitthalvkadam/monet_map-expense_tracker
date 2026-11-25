package com.moneymap.finance;

import com.moneymap.common.OwnedEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
public class Subscription extends OwnedEntity {

    @NotBlank(message = "Name is required")
    @Size(max = 40, message = "Name is too long")
    @Column(nullable = false, length = 40)
    public String name;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Column(nullable = false, precision = 14, scale = 2)
    public BigDecimal amount;

    @NotBlank(message = "Billing cycle is required")
    @Pattern(regexp = "monthly|yearly", message = "Billing must be monthly or yearly")
    @Column(nullable = false, length = 10)
    public String cycle;

    @NotNull(message = "Next payment date is required")
    @Column(name = "next_date", nullable = false)
    public LocalDate nextDate;

    @Column(nullable = false)
    public boolean active = true;
}
