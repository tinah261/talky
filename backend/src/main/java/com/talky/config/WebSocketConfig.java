package com.talky.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Activer le broker simple pour les messages
        config.enableSimpleBroker("/queue/", "/topic/");
        
        // Préfixe pour les messages envoyés depuis le client
        config.setApplicationDestinationPrefixes("/app");
        
        // Préfixe pour les messages privés (user destination)
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket avec SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                .withSockJS();
        
        // Endpoint WebSocket sans SockJS (optionnel)
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173");
    }
}