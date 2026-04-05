<?php
// GET /notifications
if ($method === 'GET' && !$id) {
    $user = require_auth($pdo);
    $stmt = $pdo->prepare('SELECT * FROM notifications WHERE owner_id=? ORDER BY created_at DESC LIMIT 20');
    $stmt->execute([$user['id']]);
    json_response($stmt->fetchAll());
}

// PATCH /notifications/read-all
if ($method === 'PATCH' && $id === 'read-all') {
    $user = require_auth($pdo);
    $pdo->prepare('UPDATE notifications SET is_read=1 WHERE owner_id=?')->execute([$user['id']]);
    json_response(['message' => 'All notifications marked as read']);
}

error_response('Not found', 404);
