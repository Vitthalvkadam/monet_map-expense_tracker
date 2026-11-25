package com.moneymap.common;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.transaction.annotation.Transactional;

/** Every query is filtered by user id, so one user can never see another user's data. */
@NoRepositoryBean
public interface OwnedRepository<T extends OwnedEntity> extends JpaRepository<T, UUID> {

    List<T> findByUserIdOrderByCreatedAtAsc(UUID userId);

    Optional<T> findByIdAndUserId(UUID id, UUID userId);

    @Transactional
    void deleteByUserId(UUID userId);
}
