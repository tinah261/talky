package com.talky.repository;

import com.talky.entity.Message;
import com.talky.entity.Reaction;
import com.talky.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByMessageAndUser(Message message, User user);
    
    List<Reaction> findByMessage(Message message);
    
    @Query("SELECT r FROM Reaction r WHERE r.message.id = :messageId")
    List<Reaction> findByMessageId(Long messageId);
}