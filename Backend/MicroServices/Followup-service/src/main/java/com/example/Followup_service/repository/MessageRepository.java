package com.example.Followup_service.repository;

import com.example.Followup_service.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :u1 AND m.receiverId = :u2) OR " +
           "(m.senderId = :u2 AND m.receiverId = :u1) " +
           "ORDER BY m.sentAt ASC")
    List<Message> findConversation(@Param("u1") Long u1, @Param("u2") Long u2);

    List<Message> findByReceiverIdAndReadFalse(Long receiverId);

    long countByReceiverIdAndReadFalse(Long receiverId);

    // For bond status: count messages between two users
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "(m.senderId = :u1 AND m.receiverId = :u2) OR " +
           "(m.senderId = :u2 AND m.receiverId = :u1)")
    long countConversation(@Param("u1") Long u1, @Param("u2") Long u2);

    // Find all distinct conversation partners for a user
    @Query("SELECT DISTINCT CASE WHEN m.senderId = :userId THEN m.receiverId ELSE m.senderId END " +
           "FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId")
    List<Long> findConversationPartners(@Param("userId") Long userId);

    // Last message in a conversation
    @Query("SELECT m FROM Message m WHERE " +
           "((m.senderId = :u1 AND m.receiverId = :u2) OR (m.senderId = :u2 AND m.receiverId = :u1)) " +
           "ORDER BY m.sentAt DESC LIMIT 1")
    java.util.Optional<Message> findLastMessage(@Param("u1") Long u1, @Param("u2") Long u2);
}
