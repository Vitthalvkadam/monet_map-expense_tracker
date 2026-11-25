package com.moneymap.common;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/** Base class for everything that belongs to one user (transactions, budgets, goals, subscriptions). */
@MappedSuperclass
public abstract class OwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @JsonIgnore
    @Column(name = "user_id", nullable = false, updatable = false)
    public UUID userId;

    @JsonIgnore
    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
