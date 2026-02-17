package com.talky.controller;

import com.talky.entity.Message;
import com.talky.entity.User;
import com.talky.service.AuthService;
import com.talky.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final AuthService    authService;

    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            return ResponseEntity.ok(messageService.getConversations(currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(List.of(Map.of("error", e.getMessage())));
        }
    }

    @GetMapping("/conversation/{contactId}")
    public ResponseEntity<List<Map<String, Object>>> getConversation(
            @PathVariable Long contactId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            return ResponseEntity.ok(messageService.getConversation(contactId, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(List.of(Map.of("error", e.getMessage())));
        }
    }

    @PostMapping("/send/{receiverId}")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable Long receiverId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User   currentUser = authService.getCurrentUser(userDetails.getUsername());
            String content     = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le message ne peut pas être vide"));
            }
            Message message = messageService.sendMessage(receiverId, content, currentUser);
            return ResponseEntity.ok(messageService.mapMessageToDTO(message));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // ── DELETE /api/messages/{id} ──────────────────────────────────────────────
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteMessage(
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            Map<String, Object> result = messageService.deleteMessage(messageId, currentUser);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // ── PUT /api/messages/{id} ─────────────────────────────────────────────────
    @PutMapping("/{messageId}")
    public ResponseEntity<Map<String, Object>> editMessage(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User   currentUser = authService.getCurrentUser(userDetails.getUsername());
            String newContent  = request.get("content");
            Map<String, Object> result = messageService.editMessage(messageId, newContent, currentUser);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/read/{senderId}")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long senderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            messageService.markAsRead(senderId, currentUser);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = authService.getCurrentUser(userDetails.getUsername());
            return ResponseEntity.ok(Map.of("count", messageService.getUnreadCount(currentUser)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}