package com.talky.service;

import com.talky.dto.ChangePasswordRequest;
import com.talky.dto.UpdateProfileRequest;
import com.talky.entity.User;
import com.talky.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository     userRepository;
    private final PasswordEncoder    passwordEncoder;

    // Dossier où les avatars sont sauvegardés (crée-le s'il n'existe pas)
    private static final String UPLOAD_DIR = "uploads/avatars/";

    // ── Mettre à jour le profil ────────────────────────────────────────────────
    @Transactional
    public Map<String, Object> updateProfile(UpdateProfileRequest req, User currentUser) {

        // Vérifier unicité username si changé
        if (req.getUsername() != null && !req.getUsername().equals(currentUser.getUsername())) {
            if (userRepository.existsByUsername(req.getUsername())) {
                throw new RuntimeException("Ce nom d'utilisateur est déjà pris");
            }
            currentUser.setUsername(req.getUsername());
        }

        // Vérifier unicité email si changé
        if (req.getEmail() != null && !req.getEmail().equals(currentUser.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new RuntimeException("Cet email est déjà utilisé");
            }
            currentUser.setEmail(req.getEmail());
        }

        // Statut personnalisé
        if (req.getStatus() != null) {
            // Ajoute le champ `status` à ton entité User si ce n'est pas déjà fait
            // currentUser.setStatus(req.getStatus());
        }

        // Avatar URL (après upload)
        if (req.getAvatar() != null && !req.getAvatar().isBlank()) {
            currentUser.setAvatar(req.getAvatar());
        }

        userRepository.save(currentUser);
        return mapUserToDTO(currentUser);
    }

    // ── Upload avatar ──────────────────────────────────────────────────────────
    public String uploadAvatar(MultipartFile file, User currentUser) throws IOException {
        // Valider le type de fichier
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Seules les images sont acceptées");
        }

        // Valider la taille (max 5 MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("L'image ne doit pas dépasser 5 MB");
        }

        // Créer le dossier si nécessaire
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom unique
        String extension = getExtension(file.getOriginalFilename());
        String fileName  = "avatar_" + currentUser.getId() + "_" + UUID.randomUUID() + extension;
        Path   filePath  = uploadPath.resolve(fileName);

        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retourner l'URL publique
        String avatarUrl = "/uploads/avatars/" + fileName;

        // Mettre à jour l'avatar en base
        currentUser.setAvatar(avatarUrl);
        userRepository.save(currentUser);

        return avatarUrl;
    }

    // ── Changer le mot de passe ────────────────────────────────────────────────
    @Transactional
    public void changePassword(ChangePasswordRequest req, User currentUser) {
        if (!passwordEncoder.matches(req.getCurrentPassword(), currentUser.getPassword())) {
            throw new RuntimeException("Mot de passe actuel incorrect");
        }
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            throw new RuntimeException("Le nouveau mot de passe doit contenir au moins 6 caractères");
        }
        currentUser.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(currentUser);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    public Map<String, Object> mapUserToDTO(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id",       user.getId());
        dto.put("username", user.getUsername());
        dto.put("email",    user.getEmail());
        dto.put("avatar",   user.getAvatar());
        dto.put("isOnline", user.getIsOnline());
        dto.put("lastSeen", user.getLastSeen());
        return dto;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}