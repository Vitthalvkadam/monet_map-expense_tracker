package com.moneymap.finance;

import com.moneymap.common.CurrentUser;
import com.moneymap.user.User;
import com.moneymap.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    public record SettingsDto(
            @NotNull @Pattern(regexp = "[A-Z]{3}", message = "Invalid currency") String currency,
            @NotNull @Pattern(regexp = "light|dark", message = "Theme must be light or dark") String theme,
            @NotNull @Size(max = 60, message = "Name is too long") String userName) {}

    private final UserRepository users;

    public SettingsController(UserRepository users) {
        this.users = users;
    }

    static SettingsDto toDto(User u) {
        return new SettingsDto(u.currency, u.theme, u.name);
    }

    @GetMapping
    public SettingsDto get() {
        return toDto(currentUser());
    }

    @PutMapping
    public SettingsDto update(@Valid @RequestBody SettingsDto body) {
        User user = currentUser();
        user.currency = body.currency();
        user.theme = body.theme();
        user.name = body.userName().trim();
        return toDto(users.save(user));
    }

    private User currentUser() {
        return users.findById(CurrentUser.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
    }
}
