package com.em.expensemanagerbackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.em.expensemanagerbackend.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Find all notifications for a specific user (recipient), ordered by creation date (newest first)
    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(@Param("recipientId") Long recipientId);

    // Find unread notifications for a specific user
    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByRecipientId(@Param("recipientId") Long recipientId);

    // Count unread notifications for a specific user
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = :recipientId AND n.isRead = false")
    Long countUnreadByRecipientId(@Param("recipientId") Long recipientId);

    // Mark all notifications as read for a specific user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :recipientId AND n.isRead = false")
    int markAllAsReadByRecipientId(@Param("recipientId") Long recipientId);

    // Find notifications related to a specific expense request
    @Query("SELECT n FROM Notification n WHERE n.expenseRequest.id = :expenseRequestId ORDER BY n.createdAt DESC")
    List<Notification> findByExpenseRequestId(@Param("expenseRequestId") Long expenseRequestId);

    // Find recent notifications for a user (last 30 days)
    @Query(value = "SELECT * FROM notifications n WHERE n.recipient_id = :recipientId AND n.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ORDER BY n.created_at DESC", nativeQuery = true)
    List<Notification> findRecentByRecipientId(@Param("recipientId") Long recipientId);
}
