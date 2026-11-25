package com.moneymap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// We do our own JWT login, so Spring's default in-memory user is switched off.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class MoneyMapApplication {
    public static void main(String[] args) {
        SpringApplication.run(MoneyMapApplication.class, args);
    }
}
