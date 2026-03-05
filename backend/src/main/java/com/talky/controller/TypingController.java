package com.talky.controller;

import com.talky.entity.User;
import com.talky.repository.UserRepository;
import com.talky.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class TypingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AuthService           authService;
    private final UserRepository        userRepository;

    /**
     * /app/typing/{receiverId}
     * Notifie le destinataire que l'expéditeur est en train d'écrire
     */
    @MessageMapping("/typing/{receiverId}")
    public void handleTyping(
            @DestinationVariable Long receiverId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            User sender = authService.getCurrentUser(userDetails.getUsername());
            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new RuntimeException("Destinataire non trouvé"));

            // Envoyer au destinataire via WebSocket
            messagingTemplate.convertAndSendToUser(
                    receiver.getUsername(),
                    "/queue/typing",
                    Map.of("senderId", sender.getId(), "typing", true)
            );
        } catch (Exception e) {
            // Ignorer les erreurs silencieusement (l'utilisateur a peut-être fermé la session)
        }
    }
}