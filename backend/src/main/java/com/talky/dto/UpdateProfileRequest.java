package com.talky.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String username;
    private String email;
    private String status;       // statut personnalisé ex: "Disponible"
    private String avatar;       // URL de l'avatar (généré après upload)
}