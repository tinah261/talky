package com.talky.service;

import com.talky.entity.Message;
import com.talky.entity.User;
import com.talky.repository.MessageRepository;
import com.talky.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository      messageRepository;
    private final UserRepository         userRepository;
    private final SimpMessagingTemplate  messagingTemplate;

    @Transactional
    public Message sendMessage(Long receiverId, String content, User sender) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Destinataire non trouvé"));

        Message message = Message.builder()
                .content(content)
                .sender(sender)
                .receiver(receiver)
                .isRead(false)
                .isDeleted(false)
                .build();

        message = messageRepository.save(message);

        messagingTemplate.convertAndSendToUser(
                receiver.getUsername(),
                "/queue/messages",
                mapMessageToDTO(message)
        );

        return message;
    }

    // ── Supprimer un message ───────────────────────────────────────────────────
    @Transactional
    public Map<String, Object> deleteMessage(Long messageId, User currentUser) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));

        // Seul l'expéditeur peut supprimer
        if (!message.getSender().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez supprimer que vos propres messages");
        }

        message.setIsDeleted(true);
        message.setContent("Ce message a été supprimé");
        messageRepository.save(message);

        Map<String, Object> dto = mapMessageToDTO(message);

        // Notifier le destinataire en temps réel
        messagingTemplate.convertAndSendToUser(
                message.getReceiver().getUsername(),
                "/queue/messages",
                dto
        );

        return dto;
    }

    // ── Modifier un message ────────────────────────────────────────────────────
    @Transactional
    public Map<String, Object> editMessage(Long messageId, String newContent, User currentUser) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));

        // Seul l'expéditeur peut modifier
        if (!message.getSender().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez modifier que vos propres messages");
        }

        if (message.getIsDeleted()) {
            throw new RuntimeException("Impossible de modifier un message supprimé");
        }

        if (newContent == null || newContent.trim().isEmpty()) {
            throw new RuntimeException("Le contenu ne peut pas être vide");
        }

        message.setContent(newContent.trim());
        message.setEditedAt(LocalDateTime.now());
        messageRepository.save(message);

        Map<String, Object> dto = mapMessageToDTO(message);

        // Notifier le destinataire en temps réel
        messagingTemplate.convertAndSendToUser(
                message.getReceiver().getUsername(),
                "/queue/messages",
                dto
        );

        return dto;
    }

    public List<Map<String, Object>> getConversation(Long contactId, User currentUser) {
        User contact = userRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact non trouvé"));

        List<Message> messages = messageRepository.findConversation(currentUser, contact);
        return messages.stream()
                .map(this::mapMessageToDTO)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getConversations(User currentUser) {
        List<User> contacts = messageRepository.findContactsWithMessages(currentUser);

        List<Map<String, Object>> conversations = new ArrayList<>();

        for (User contact : contacts) {
            Message lastMessage = messageRepository.findLastMessageBetweenUsers(currentUser, contact);
            long unreadCount = messageRepository.findUnreadMessagesBetweenUsers(currentUser, contact).size();

            Map<String, Object> conv = new HashMap<>();
            conv.put("id",          contact.getId());
            conv.put("contact",     mapUserToDTO(contact));
            conv.put("lastMessage", lastMessage != null ? mapMessageToDTO(lastMessage) : null);
            conv.put("unreadCount", unreadCount);
            conversations.add(conv);
        }

        return conversations;
    }

    @Transactional
    public void markAsRead(Long senderId, User currentUser) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Expéditeur non trouvé"));
        messageRepository.markMessagesAsRead(sender, currentUser);
    }

    public long getUnreadCount(User user) {
        return messageRepository.countUnreadByReceiver(user);
    }

    public Map<String, Object> mapMessageToDTO(Message message) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id",        message.getId());
        dto.put("content",   message.getContent());
        dto.put("sender",    mapUserToDTO(message.getSender()));
        dto.put("receiver",  mapUserToDTO(message.getReceiver()));
        dto.put("isRead",    message.getIsRead());
        dto.put("isDeleted", message.getIsDeleted());
        dto.put("editedAt",  message.getEditedAt() != null ? message.getEditedAt().toString() : null);
        dto.put("createdAt", message.getCreatedAt().toString());
        return dto;
    }

    public Map<String, Object> mapUserToDTO(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id",       user.getId());
        dto.put("username", user.getUsername());
        dto.put("email",    user.getEmail());
        dto.put("avatar",   user.getAvatar());
        dto.put("isOnline", user.getIsOnline());
        return dto;
    }
}