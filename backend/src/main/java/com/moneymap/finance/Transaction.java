package com.moneymap.finance;

import com.moneymap.common.OwnedEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction extends OwnedEntity {

    @NotBlank(message = "Type is required")
    @Pattern(regexp = "income|expense", message = "Type must be income or expense")
    @Column(nullable = false, length = 10)
    public String type;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Column(nullable = false, precision = 14, scale = 2)
    public BigDecimal amount;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    public String category;

    @NotBlank(message = "Description is required")
    @Size(max = 80, message = "Description is too long")
    @Column(nullable = false, length = 80)
    public String description;

    @NotNull(message = "Date is required")
    @Column(name = "tx_date", nullable = false)
    public LocalDate date;
}
