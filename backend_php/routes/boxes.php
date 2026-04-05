<?php
// Routes: /boxes/:id  (standalone box operations)
// Also called from turfs.php for /turfs/:turfId/boxes

// GET /boxes/:id — not used standalone, but PUT/DELETE are
if ($method === 'PUT' && $id) {
    $user = require_owner($pdo);
    $b = get_body();

    $stmt = $pdo->prepare('SELECT boxes.*, turfs.owner_id FROM boxes JOIN turfs ON boxes.turf_id=turfs.id WHERE boxes.id=?');
    $stmt->execute([$id]);
    $box = $stmt->fetch();
    if (!$box) error_response('Box not found', 404);
    if ($box['owner_id'] != $user['id']) error_response('Not authorized', 403);

    $name      = $b['name'] ?? $box['name'];
    $desc      = $b['description'] ?? $box['description'];
    $slots     = isset($b['timeSlots']) ? json_encode($b['timeSlots']) : $box['time_slots'];
    $isActive  = isset($b['isActive']) ? (int)$b['isActive'] : $box['is_active'];

    $pdo->prepare('UPDATE boxes SET name=?,description=?,time_slots=?,is_active=? WHERE id=?')
        ->execute([$name, $desc, $slots, $isActive, $id]);

    $stmt = $pdo->prepare('SELECT * FROM boxes WHERE id=?');
    $stmt->execute([$id]);
    $box = $stmt->fetch();
    $box['time_slots'] = json_decode($box['time_slots'] ?? '[]', true);
    json_response($box);
}

if ($method === 'DELETE' && $id) {
    $user = require_owner($pdo);
    $stmt = $pdo->prepare('SELECT boxes.*, turfs.owner_id FROM boxes JOIN turfs ON boxes.turf_id=turfs.id WHERE boxes.id=?');
    $stmt->execute([$id]);
    $box = $stmt->fetch();
    if (!$box) error_response('Box not found', 404);
    if ($box['owner_id'] != $user['id']) error_response('Not authorized', 403);
    $pdo->prepare('DELETE FROM boxes WHERE id=?')->execute([$id]);
    json_response(['message' => 'Box deleted']);
}

error_response('Not found', 404);
