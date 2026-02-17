package com.talky.controller;

import com.talky.entity.User;
import com.talky.service.AuthService;
import com.talky.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getContacts(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            List<Map<String, Object>> contacts = contactService.getContacts(currentUser);
            return ResponseEntity.ok(contacts);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(List.of(Map.of("error", e.getMessage())));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchUsers(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            List<Map<String, Object>> users = contactService.searchUsers(q, currentUser);
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(List.of(Map.of("error", e.getMessage())));
        }
    }

    @PostMapping("/add/{contactId}")
    public ResponseEntity<Map<String, Object>> addContact(
            @PathVariable Long contactId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            Map<String, Object> contact = contactService.addContact(contactId, currentUser);
            return ResponseEntity.ok(contact);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{contactId}")
    public ResponseEntity<Map<String, String>> removeContact(
            @PathVariable Long contactId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            contactService.removeContact(contactId, currentUser);
            return ResponseEntity.ok(Map.of("message", "Contact supprimé"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/block/{contactId}")
    public ResponseEntity<Map<String, String>> blockContact(
            @PathVariable Long contactId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            contactService.blockContact(contactId, currentUser);
            return ResponseEntity.ok(Map.of("message", "Contact bloqué"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/is-blocked/{contactId}")
    public ResponseEntity<Map<String, Object>> isBlocked(
            @PathVariable Long contactId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            boolean blocked = contactService.isBlocked(contactId, currentUser);
            return ResponseEntity.ok(Map.of("isBlocked", blocked));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}