package com.moneymap.common;

import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;

/** The id of the logged-in user for the current request. */
public final class CurrentUser {
    private CurrentUser() {}

    public static UUID id() {
        return (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
