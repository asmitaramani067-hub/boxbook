<?php
purge_expired_locks($pdo);

// POST /bookings  — create booking
if ($method === 'POST' && !$id) {
    $user = require_auth($pdo);
    $b = get_body();
    $turfId      = $b['turfId'] ?? null;
    $date        = $b['date'] ?? null;
    $timeSlot    = $b['timeSlot'] ?? null;
    $playerName  = $b['playerName'] ?? $user['name'];
    $playerPhone = $b['playerPhone'] ?? $user['phone'];

    if (!$turfId || !$date || !$timeSlot) error_response('turfId, date and timeSlot are required');

    $stmt = $pdo->prepare('SELECT * FROM turfs WHERE id=?');
    $stmt->execute([$turfId]);
    $turf = $stmt->fetch();
    if (!$turf) error_response('Turf not found', 404);

    // Find boxes that have this slot
    $stmt = $pdo->prepare("SELECT * FROM boxes WHERE turf_id=? AND is_active=1 AND JSON_CONTAINS(time_slots, JSON_QUOTE(?))");
    $stmt->execute([$turfId, $timeSlot]);
    $boxes = $stmt->fetchAll();
    if (!$boxes) error_response('No boxes available for this slot');

    // Find booked box IDs for this slot
    $stmt = $pdo->prepare("SELECT box_id FROM bookings WHERE turf_id=? AND date=? AND time_slot=? AND status != 'cancelled'");
    $stmt->execute([$turfId, $date, $timeSlot]);
    $bookedIds = array_column($stmt->fetchAll(), 'box_id');

    $freeBox = null;
    foreach ($boxes as $box) {
        if (!in_array($box['id'], $bookedIds)) { $freeBox = $box; break; }
    }
    if (!$freeBox) error_response('All boxes are booked for this slot. Please choose another time.');

    // Check slot lock
    $stmt = $pdo->prepare('SELECT * FROM slot_locks WHERE turf_id=? AND date=? AND time_slot=? AND expires_at > NOW()');
    $stmt->execute([$turfId, $date, $timeSlot]);
    $lock = $stmt->fetch();
    if ($lock && $lock['user_id'] != $user['id']) error_response('This slot is temporarily held by another user. Please wait a moment.', 409);

    // Determine price
    $pricing = json_decode($turf['slot_pricing'] ?? '{}', true);
    $price   = $pricing[$timeSlot] ?? $turf['price_per_hour'];

    $stmt = $pdo->prepare('INSERT INTO bookings (user_id, turf_id, box_id, date, time_slot, total_price, player_name, player_phone) VALUES (?,?,?,?,?,?,?,?)');
    $stmt->execute([$user['id'], $turfId, $freeBox['id'], $date, $timeSlot, $price, $playerName, $playerPhone]);
    $bookingId = $pdo->lastInsertId();

    // Release lock
    $pdo->prepare('DELETE FROM slot_locks WHERE turf_id=? AND date=? AND time_slot=? AND user_id=?')
        ->execute([$turfId, $date, $timeSlot, $user['id']]);

    // Notify owner
    $pdo->prepare('INSERT INTO notifications (owner_id, message, booking_id) VALUES (?,?,?)')
        ->execute([$turf['owner_id'], "New booking at {$turf['name']} — $playerName on $date ($timeSlot)", $bookingId]);

    $stmt = $pdo->prepare('SELECT b.*, t.name AS turf_name, t.location AS turf_location, bx.name AS box_name
                           FROM bookings b JOIN turfs t ON b.turf_id=t.id JOIN boxes bx ON b.box_id=bx.id WHERE b.id=?');
    $stmt->execute([$bookingId]);
    json_response($stmt->fetch(), 201);
}

// GET /bookings/my
if ($method === 'GET' && $id === 'my') {
    $user = require_auth($pdo);
    $stmt = $pdo->prepare('SELECT b.*, t.name AS turf_name, t.location AS turf_location, t.price_per_hour,
                           bx.name AS box_name
                           FROM bookings b JOIN turfs t ON b.turf_id=t.id JOIN boxes bx ON b.box_id=bx.id
                           WHERE b.user_id=? ORDER BY b.created_at DESC');
    $stmt->execute([$user['id']]);
    json_response($stmt->fetchAll());
}

// GET /bookings/owner
if ($method === 'GET' && $id === 'owner') {
    $user = require_owner($pdo);
    $stmt = $pdo->prepare('SELECT t.id FROM turfs t WHERE t.owner_id=?');
    $stmt->execute([$user['id']]);
    $turfIds = array_column($stmt->fetchAll(), 'id');
    if (!$turfIds) json_response([]);

    $in = implode(',', array_fill(0, count($turfIds), '?'));
    $stmt = $pdo->prepare("SELECT b.*, t.name AS turf_name, t.location AS turf_location,
                           bx.name AS box_name, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
                           FROM bookings b JOIN turfs t ON b.turf_id=t.id JOIN boxes bx ON b.box_id=bx.id
                           JOIN users u ON b.user_id=u.id
                           WHERE b.turf_id IN ($in) ORDER BY b.created_at DESC");
    $stmt->execute($turfIds);
    json_response($stmt->fetchAll());
}

// GET /bookings/slots?turfId=&date=
if ($method === 'GET' && $id === 'slots') {
    $turfId = $_GET['turfId'] ?? null;
    $date   = $_GET['date'] ?? null;
    if (!$turfId || !$date) error_response('turfId and date are required');

    $stmt = $pdo->prepare('SELECT * FROM boxes WHERE turf_id=? AND is_active=1');
    $stmt->execute([$turfId]);
    $boxes = $stmt->fetchAll();
    if (!$boxes) json_response([]);

    $allSlots = [];
    foreach ($boxes as $b) $allSlots = array_unique(array_merge($allSlots, json_decode($b['time_slots'] ?? '[]', true)));

    $stmt = $pdo->prepare("SELECT box_id, time_slot FROM bookings WHERE turf_id=? AND date=? AND status != 'cancelled'");
    $stmt->execute([$turfId, $date]);
    $bookings = $stmt->fetchAll();

    $fullyBooked = [];
    foreach ($allSlots as $slot) {
        $boxesWithSlot = array_filter($boxes, fn($b) => in_array($slot, json_decode($b['time_slots'] ?? '[]', true)));
        $bookedCount   = count(array_filter($bookings, fn($bk) => $bk['time_slot'] === $slot));
        if ($bookedCount >= count($boxesWithSlot)) $fullyBooked[] = $slot;
    }
    json_response($fullyBooked);
}

// GET /bookings/locks?turfId=&date=
if ($method === 'GET' && $id === 'locks') {
    $turfId = $_GET['turfId'] ?? null;
    $date   = $_GET['date'] ?? null;
    if (!$turfId || !$date) error_response('turfId and date are required');

    $stmt = $pdo->prepare('SELECT time_slot, expires_at FROM slot_locks WHERE turf_id=? AND date=? AND expires_at > NOW()');
    $stmt->execute([$turfId, $date]);
    $locks = [];
    foreach ($stmt->fetchAll() as $row) {
        $locks[$row['time_slot']] = strtotime($row['expires_at']) * 1000; // ms timestamp
    }
    json_response($locks);
}

// POST /bookings/lock
if ($method === 'POST' && $id === 'lock') {
    $user = require_auth($pdo);
    $b = get_body();
    $turfId   = $b['turfId'] ?? null;
    $date     = $b['date'] ?? null;
    $timeSlot = $b['timeSlot'] ?? null;
    if (!$turfId || !$date || !$timeSlot) error_response('turfId, date and timeSlot are required');

    $ttlMs   = 2 * 60 * 1000;
    $expires = date('Y-m-d H:i:s', time() + 120);

    // Check existing lock
    $stmt = $pdo->prepare('SELECT * FROM slot_locks WHERE turf_id=? AND date=? AND time_slot=? AND expires_at > NOW()');
    $stmt->execute([$turfId, $date, $timeSlot]);
    $existing = $stmt->fetch();

    if ($existing && $existing['user_id'] != $user['id']) {
        error_response('Slot is temporarily held by another user', 409);
    }

    // Upsert lock
    $pdo->prepare('INSERT INTO slot_locks (turf_id, date, time_slot, user_id, expires_at) VALUES (?,?,?,?,?)
                   ON DUPLICATE KEY UPDATE user_id=?, expires_at=?')
        ->execute([$turfId, $date, $timeSlot, $user['id'], $expires, $user['id'], $expires]);

    json_response(['locked' => true, 'expiresAt' => strtotime($expires) * 1000, 'ttlMs' => $ttlMs]);
}

// DELETE /bookings/lock
if ($method === 'DELETE' && $id === 'lock') {
    $user = require_auth($pdo);
    $b = get_body();
    $pdo->prepare('DELETE FROM slot_locks WHERE turf_id=? AND date=? AND time_slot=? AND user_id=?')
        ->execute([$b['turfId'] ?? 0, $b['date'] ?? '', $b['timeSlot'] ?? '', $user['id']]);
    json_response(['unlocked' => true]);
}

// GET /bookings/waitlist
if ($method === 'GET' && $id === 'waitlist') {
    $user = require_auth($pdo);
    $turfId = $_GET['turfId'] ?? null;
    $date   = $_GET['date'] ?? null;
    $sql = 'SELECT time_slot AS slot, date, turf_id AS turf FROM waitlist WHERE user_id=?';
    $params = [$user['id']];
    if ($turfId) { $sql .= ' AND turf_id=?'; $params[] = $turfId; }
    if ($date)   { $sql .= ' AND date=?';    $params[] = $date; }
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_response($stmt->fetchAll());
}

// POST /bookings/waitlist
if ($method === 'POST' && $id === 'waitlist') {
    $user = require_auth($pdo);
    $b = get_body();
    $turfId   = $b['turfId'] ?? null;
    $date     = $b['date'] ?? null;
    $timeSlot = $b['timeSlot'] ?? null;
    if (!$turfId || !$date || !$timeSlot) error_response('turfId, date and timeSlot are required');

    try {
        $pdo->prepare('INSERT INTO waitlist (turf_id, date, time_slot, user_id) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE notified=0')
            ->execute([$turfId, $date, $timeSlot, $user['id']]);
    } catch (PDOException $e) { /* already on waitlist */ }

    json_response(['message' => "You're on the waitlist! We'll notify you if a slot opens."]);
}

// DELETE /bookings/waitlist
if ($method === 'DELETE' && $id === 'waitlist') {
    $user = require_auth($pdo);
    $b = get_body();
    $pdo->prepare('DELETE FROM waitlist WHERE turf_id=? AND date=? AND time_slot=? AND user_id=?')
        ->execute([$b['turfId'] ?? 0, $b['date'] ?? '', $b['timeSlot'] ?? '', $user['id']]);
    json_response(['message' => 'Removed from waitlist']);
}

// PUT /bookings/:id/cancel
if ($method === 'PUT' && $id && $sub === 'cancel') {
    $user = require_auth($pdo);
    $stmt = $pdo->prepare('SELECT * FROM bookings WHERE id=?');
    $stmt->execute([$id]);
    $booking = $stmt->fetch();
    if (!$booking) error_response('Booking not found', 404);
    if ($booking['user_id'] != $user['id']) error_response('Not authorized', 403);

    $pdo->prepare("UPDATE bookings SET status='cancelled' WHERE id=?")->execute([$id]);
    notify_waitlist($pdo, $booking['turf_id'], $booking['date'], $booking['time_slot']);
    json_response(['message' => 'Booking cancelled']);
}

// PUT /bookings/:id/reschedule
if ($method === 'PUT' && $id && $sub === 'reschedule') {
    $user = require_auth($pdo);
    $b = get_body();
    $newDate = $b['date'] ?? null;
    $newSlot = $b['timeSlot'] ?? null;
    if (!$newDate || !$newSlot) error_response('date and timeSlot are required');

    $stmt = $pdo->prepare('SELECT b.*, t.price_per_hour, t.slot_pricing FROM bookings b JOIN turfs t ON b.turf_id=t.id WHERE b.id=?');
    $stmt->execute([$id]);
    $booking = $stmt->fetch();
    if (!$booking) error_response('Booking not found', 404);
    if ($booking['user_id'] != $user['id']) error_response('Not authorized', 403);
    if ($booking['status'] === 'cancelled') error_response('Cannot reschedule a cancelled booking');

    $stmt = $pdo->prepare("SELECT * FROM boxes WHERE turf_id=? AND is_active=1 AND JSON_CONTAINS(time_slots, JSON_QUOTE(?))");
    $stmt->execute([$booking['turf_id'], $newSlot]);
    $boxes = $stmt->fetchAll();
    if (!$boxes) error_response('No boxes available for the new slot');

    $stmt = $pdo->prepare("SELECT box_id FROM bookings WHERE turf_id=? AND date=? AND time_slot=? AND status != 'cancelled' AND id != ?");
    $stmt->execute([$booking['turf_id'], $newDate, $newSlot, $id]);
    $bookedIds = array_column($stmt->fetchAll(), 'box_id');

    $freeBox = null;
    foreach ($boxes as $box) {
        if (!in_array($box['id'], $bookedIds)) { $freeBox = $box; break; }
    }
    if (!$freeBox) error_response('All boxes are booked for that slot. Please choose another time.');

    $pricing = json_decode($booking['slot_pricing'] ?? '{}', true);
    $price   = $pricing[$newSlot] ?? $booking['price_per_hour'];

    $oldDate = $booking['date'];
    $oldSlot = $booking['time_slot'];

    $pdo->prepare('UPDATE bookings SET date=?, time_slot=?, box_id=?, total_price=? WHERE id=?')
        ->execute([$newDate, $newSlot, $freeBox['id'], $price, $id]);

    notify_waitlist($pdo, $booking['turf_id'], $oldDate, $oldSlot);

    $stmt = $pdo->prepare('SELECT b.*, t.name AS turf_name, t.location AS turf_location, bx.name AS box_name
                           FROM bookings b JOIN turfs t ON b.turf_id=t.id JOIN boxes bx ON b.box_id=bx.id WHERE b.id=?');
    $stmt->execute([$id]);
    json_response($stmt->fetch());
}

error_response('Not found', 404);

// ── Waitlist notification helper ───────────────────────────────────────────
function notify_waitlist(PDO $pdo, $turfId, $date, $timeSlot): void {
    $stmt = $pdo->prepare('SELECT w.*, u.name AS user_name, u.email AS user_email FROM waitlist w JOIN users u ON w.user_id=u.id WHERE w.turf_id=? AND w.date=? AND w.time_slot=? AND w.notified=0 ORDER BY w.created_at ASC LIMIT 1');
    $stmt->execute([$turfId, $date, $timeSlot]);
    $entry = $stmt->fetch();
    if (!$entry) return;

    $pdo->prepare('UPDATE waitlist SET notified=1 WHERE id=?')->execute([$entry['id']]);

    $stmt = $pdo->prepare('SELECT name FROM turfs WHERE id=?');
    $stmt->execute([$turfId]);
    $turf = $stmt->fetch();
    $msg = "A slot just opened up! {$turf['name']} — $timeSlot on $date is now available. Book quickly!";

    $pdo->prepare('INSERT INTO notifications (owner_id, message) VALUES (?,?)')->execute([$entry['user_id'], $msg]);
}
