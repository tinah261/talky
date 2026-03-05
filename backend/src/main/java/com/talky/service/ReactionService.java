package com.talky.service;

import com.talky.entity.Message;
import com.talky.entity.Reaction;
import com.talky.entity.User;
import com.talky.repository.MessageRepository;
import com.talky.repository.ReactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository     reactionRepository;
    private final MessageRepository      messageRepository;
    private final SimpMessagingTemplate  messagingTemplate;

    @Transactional
    public Map<String, Object> toggleReaction(Long messageId, String emoji, User currentUser) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));

        Optional<Reaction> existing = reactionRepository.findByMessageAndUser(message, currentUser);

        if (existing.isPresent()) {
            Reaction reaction = existing.get();
            // Si même emoji → supprimer
            if (reaction.getEmoji().equals(emoji)) {
                reactionRepository.delete(reaction);
            } else {
                // Sinon → changer l'emoji
                reaction.setEmoji(emoji);
                reactionRepository.save(reaction);
            }
        } else {
            // Créer nouvelle réaction
            Reaction reaction = Reaction.builder()
                    .message(message)
                    .user(currentUser)
                    .emoji(emoji)
                    .build();
            reactionRepository.save(reaction);
        }

        // Récupérer toutes les réactions du message
        Map<String, Object> result = getMessageReactions(messageId);

        // Notifier les participants via WebSocket
        notifyReactionUpdate(message, result);

        return result;
    }

    public Map<String, Object> getMessageReactions(Long messageId) {
        List<Reaction> reactions = reactionRepository.findByMessageId(messageId);

        // Grouper par emoji avec liste des userIds
        Map<String, List<Long>> grouped = reactions.stream()
                .collect(Collectors.groupingBy(
                        Reaction::getEmoji,
                        Collectors.mapping(r -> r.getUser().getId(), Collectors.toList())
                ));

        Map<String, Object> result = new HashMap<>();
        result.put("messageId", messageId);
        result.put("reactions", grouped);
        return result;
    }

    private void notifyReactionUpdate(Message message, Map<String, Object> reactions) {
        // Notifier l'expéditeur
        messagingTemplate.convertAndSendToUser(
                message.getSender().getUsername(),
                "/queue/reactions",
                reactions
        );
        // Notifier le destinataire
        messagingTemplate.convertAndSendToUser(
                message.getReceiver().getUsername(),
                "/queue/reactions",
                reactions
        );
    }
}