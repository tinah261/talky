package com.talky.repository;

import com.talky.entity.Contact;
import com.talky.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findByUser(User user);

    Optional<Contact> findByUserAndContact(User user, User contact);

    boolean existsByUserAndContact(User user, User contact);

    @Query("SELECT c FROM Contact c WHERE c.user = :user AND c.isBlocked = false")
    List<Contact> findAcceptedContacts(@Param("user") User user);

    @Query("SELECT c FROM Contact c WHERE c.user = :user AND c.isBlocked = true")
    List<Contact> findBlockedContacts(@Param("user") User user);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
           "FROM Contact c WHERE c.user = :user AND c.contact = :contact AND c.isBlocked = true")
    boolean isBlocked(@Param("user") User user, @Param("contact") User contact);

    @Query("SELECT c.contact FROM Contact c WHERE c.user = :user AND c.isBlocked = false")
    List<User> findContactsOfUser(@Param("user") User user);
}