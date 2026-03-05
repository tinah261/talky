package com.talky.controller;

import com.talky.entity.User;
import com.talky.service.AuthService;
import com.talky.service.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;
    private final AuthService     authService;

    /**
     * POST /api/reactions/{messageId}
     * Body: { "emoji": "👍" }
     * Toggle une réaction (ajoute si absente, supprime si présente avec même emoji, change si présente avec emoji différent)
     */
    @PostMapping("/{messageId}")
    public ResponseEntity<Map<String, Object>> toggleReaction(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User   currentUser = authService.getCurrentUser(userDetails.getUsername());
            String emoji       = body.get("emoji");
            
            if (emoji == null || emoji.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Emoji manquant"));
            }

            Map<String, Object> result = reactionService.toggleReaction(messageId, emoji, currentUser);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/reactions/{messageId}
     * Récupère toutes les réactions d'un message
     */
    @GetMapping("/{messageId}")
    public ResponseEntity<Map<String, Object>> getReactions(@PathVariable Long messageId) {
        try {
            return ResponseEntity.ok(reactionService.getMessageReactions(messageId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}