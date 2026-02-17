package com.talky.repository;

import com.talky.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username LIKE %:query% AND u.id != :currentUserId")
    List<User> searchUsers(String query, Long currentUserId);

    @Query("SELECT u FROM User u WHERE u.isOnline = true")
    List<User> findOnlineUsers();
}