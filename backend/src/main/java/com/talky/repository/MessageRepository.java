package com.talky.repository;

import com.talky.entity.Message;
import com.talky.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversation(
        @Param("user1") User user1, 
        @Param("user2") User user2
    );

    @Query("SELECT m FROM Message m WHERE m.receiver = :user AND m.isRead = false ORDER BY m.createdAt DESC")
    List<Message> findUnreadMessages(@Param("user") User user);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :user AND m.isRead = false")
    long countUnreadByReceiver(@Param("user") User user);

    @Query("SELECT m FROM Message m WHERE m.receiver = :receiver AND m.sender = :sender AND m.isRead = false")
    List<Message> findUnreadMessagesBetweenUsers(
        @Param("receiver") User receiver, 
        @Param("sender") User sender
    );

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender = :sender AND m.receiver = :receiver AND m.isRead = false")
    void markMessagesAsRead(
        @Param("sender") User sender, 
        @Param("receiver") User receiver
    );

   @Query("""
        SELECT m.sender
        FROM Message m
        WHERE m.receiver = :user
        GROUP BY m.sender
        ORDER BY MAX(m.createdAt) DESC
    """)
    List<User> findContactsWithMessages(@Param("user") User user);

    @Query("SELECT m FROM Message m WHERE m.id = (SELECT MAX(m2.id) FROM Message m2 WHERE " +
           "(m2.sender = :user1 AND m2.receiver = :user2) OR " +
           "(m2.sender = :user2 AND m2.receiver = :user1))")
    Message findLastMessageBetweenUsers(
        @Param("user1") User user1, 
        @Param("user2") User user2
    );
}