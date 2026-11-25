package com.moneymap.common;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** The list / create / update / delete endpoints shared by all four finance resources. */
public abstract class OwnedController<T extends OwnedEntity> {

    protected final OwnedRepository<T> repo;

    protected OwnedController(OwnedRepository<T> repo) {
        this.repo = repo;
    }

    /** Copy the editable fields from the request onto the saved entity. */
    protected abstract void copy(T from, T to);

    /** Hook for setting server-controlled defaults before the first save. */
    protected void beforeCreate(T entity) {}

    @GetMapping
    public List<T> list() {
        return repo.findByUserIdOrderByCreatedAtAsc(CurrentUser.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public T create(@Valid @RequestBody T body) {
        body.id = null;
        body.userId = CurrentUser.id();
        beforeCreate(body);
        return repo.saveAndFlush(body);
    }

    @PutMapping("/{id}")
    public T update(@PathVariable UUID id, @Valid @RequestBody T body) {
        T existing = find(id);
        copy(body, existing);
        return repo.saveAndFlush(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repo.delete(find(id));
    }

    protected T find(UUID id) {
        return repo.findByIdAndUserId(id, CurrentUser.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found"));
    }
}
