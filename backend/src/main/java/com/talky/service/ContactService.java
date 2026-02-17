package com.talky.service;

import com.talky.entity.Contact;
import com.talky.entity.User;
import com.talky.repository.ContactRepository;
import com.talky.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> addContact(Long contactId, User currentUser) {
        User contact = userRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (contact.getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez pas vous ajouter vous-même");
        }

        if (contactRepository.existsByUserAndContact(currentUser, contact)) {
            throw new RuntimeException("Ce contact existe déjà");
        }

        Contact newContact = Contact.builder()
                .user(currentUser)
                .contact(contact)
                .isBlocked(false)
                .build();

        contactRepository.save(newContact);

        // Ajouter la relation réciproque
        if (!contactRepository.existsByUserAndContact(contact, currentUser)) {
            Contact reciprocalContact = Contact.builder()
                    .user(contact)
                    .contact(currentUser)
                    .isBlocked(false)
                    .build();
            contactRepository.save(reciprocalContact);
        }

        return mapContactToDTO(newContact);
    }

    public List<Map<String, Object>> getContacts(User currentUser) {
        List<Contact> contacts = contactRepository.findAcceptedContacts(currentUser);
        
        return contacts.stream()
                .map(this::mapContactToDTO)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> searchUsers(String query, User currentUser) {
        List<User> users = userRepository.searchUsers(query, currentUser.getId());
        
        return users.stream()
                .map(this::mapUserToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeContact(Long contactId, User currentUser) {
        User contact = userRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact non trouvé"));

        contactRepository.findByUserAndContact(currentUser, contact)
                .ifPresent(contactRepository::delete);

        contactRepository.findByUserAndContact(contact, currentUser)
                .ifPresent(contactRepository::delete);
    }

    @Transactional
    public void blockContact(Long contactId, User currentUser) {
        User contact = userRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact non trouvé"));

        contactRepository.findByUserAndContact(currentUser, contact)
                .ifPresent(c -> {
                    c.setIsBlocked(true);
                    contactRepository.save(c);
                });
    }

    public boolean isBlocked(Long contactId, User currentUser) {
        User contact = userRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact non trouvé"));
        
        return contactRepository.isBlocked(currentUser, contact);
    }

    public Map<String, Object> mapContactToDTO(Contact contact) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", contact.getId());
        dto.put("contact", mapUserToDTO(contact.getContact()));
        dto.put("isBlocked", contact.getIsBlocked());
        dto.put("createdAt", contact.getCreatedAt().toString());
        return dto;
    }

    public Map<String, Object> mapUserToDTO(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("username", user.getUsername());
        dto.put("email", user.getEmail());
        dto.put("avatar", user.getAvatar());
        dto.put("isOnline", user.getIsOnline());
        dto.put("lastSeen", user.getLastSeen());
        return dto;
    }
}