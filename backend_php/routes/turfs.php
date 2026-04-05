<?php
// GET /turfs  — list all turfs (public)
if ($method === 'GET' && !$id) {
    $city     = $_GET['city'] ?? '';
    $minPrice = $_GET['minPrice'] ?? '';
    $maxPrice = $_GET['maxPrice'] ?? '';
    $search   = $_GET['search'] ?? '';

    $where = ['t.is_active = 1'];
    $params = [];

    if ($city) { $where[] = 't.city LIKE ?'; $params[] = "%$city%"; }
    if ($search) {
        $where[] = '(t.name LIKE ? OR t.location LIKE ? OR t.city LIKE ?)';
        $params[] = "%$search%"; $params[] = "%$search%"; $params[] = "%$search%";
    }
    if ($minPrice !== '') { $where[] = 't.price_per_hour >= ?'; $params[] = (float)$minPrice; }
    if ($maxPrice !== '') { $where[] = 't.price_per_hour <= ?'; $params[] = (float)$maxPrice; }

    $sql = 'SELECT t.*, u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
            FROM turfs t JOIN users u ON t.owner_id = u.id
            WHERE ' . implode(' AND ', $where) . ' ORDER BY t.created_at DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $turfs = $stmt->fetchAll();

    foreach ($turfs as &$turf) {
        $turf = decode_turf($pdo, $turf);
    }
    json_response($turfs);
}

// GET /turfs/my  — owner's turfs
if ($method === 'GET' && $id === 'my') {
    $user = require_owner($pdo);
    $stmt = $pdo->prepare('SELECT t.*, u.name AS owner_name FROM turfs t JOIN users u ON t.owner_id=u.id WHERE t.owner_id=? ORDER BY t.created_at DESC');
    $stmt->execute([$user['id']]);
    $turfs = $stmt->fetchAll();
    foreach ($turfs as &$turf) { $turf = decode_turf($pdo, $turf); }
    json_response($turfs);
}

// GET /turfs/:id/availability
if ($method === 'GET' && $id && $sub === 'availability') {
    $date = $_GET['date'] ?? '';
    if (!$date) error_response('date is required');

    $stmt = $pdo->prepare("SELECT * FROM boxes WHERE turf_id=? AND is_active=1");
    $stmt->execute([$id]);
    $boxes = $stmt->fetchAll();
    if (!$boxes) json_response([]);

    $allSlots = [];
    foreach ($boxes as $b) {
        $slots = json_decode($b['time_slots'] ?? '[]', true);
        $allSlots = array_unique(array_merge($allSlots, $slots));
    }

    $stmt = $pdo->prepare("SELECT box_id, time_slot FROM bookings WHERE turf_id=? AND date=? AND status != 'cancelled'");
    $stmt->execute([$id, $date]);
    $bookings = $stmt->fetchAll();

    $availability = [];
    foreach ($allSlots as $slot) {
        $boxesWithSlot = array_filter($boxes, fn($b) => in_array($slot, json_decode($b['time_slots'] ?? '[]', true)));
        $total  = count($boxesWithSlot);
        $booked = count(array_filter($bookings, fn($bk) => $bk['time_slot'] === $slot));
        $availability[$slot] = ['total' => $total, 'booked' => $booked, 'available' => max(0, $total - $booked)];
    }
    json_response($availability);
}

// GET /turfs/:id  — single turf
if ($method === 'GET' && $id && !$sub) {
    $stmt = $pdo->prepare('SELECT t.*, u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
                           FROM turfs t JOIN users u ON t.owner_id=u.id WHERE t.id=?');
    $stmt->execute([$id]);
    $turf = $stmt->fetch();
    if (!$turf) error_response('Turf not found', 404);
    $turf = decode_turf($pdo, $turf);

    // Reviews
    $stmt = $pdo->prepare('SELECT r.*, u.name AS reviewer_name FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.turf_id=? ORDER BY r.created_at DESC');
    $stmt->execute([$id]);
    $turf['reviews'] = $stmt->fetchAll();
    json_response($turf);
}

// POST /turfs  — create turf (owner)
if ($method === 'POST' && !$id) {
    $user = require_owner($pdo);
    $name    = trim($_POST['name'] ?? '');
    $desc    = $_POST['description'] ?? '';
    $loc     = $_POST['location'] ?? '';
    $city    = $_POST['city'] ?? '';
    $price   = (float)($_POST['pricePerHour'] ?? 0);
    $contact = $_POST['contactNumber'] ?? '';
    $mapLink = $_POST['mapLink'] ?? null;
    $slots   = $_POST['timeSlots'] ?? '[]';
    $pricing = $_POST['slotPricing'] ?? '{}';
    $amenities = $_POST['amenities'] ?? '[]';

    if (!$name || !$loc || !$city || !$price || !$contact) error_response('Missing required fields');

    // Normalize JSON strings
    if (is_string($slots) && !str_starts_with(trim($slots), '[')) $slots = json_encode(array_filter(explode(',', $slots)));
    if (is_string($amenities) && !str_starts_with(trim($amenities), '[')) $amenities = json_encode(array_filter(explode(',', $amenities)));

    $stmt = $pdo->prepare('INSERT INTO turfs (name, description, location, city, price_per_hour, contact_number, map_link, owner_id, time_slots, slot_pricing, amenities) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    $stmt->execute([$name, $desc, $loc, $city, $price, $contact, $mapLink, $user['id'], $slots, $pricing, $amenities]);
    $turfId = $pdo->lastInsertId();

    // Handle image uploads
    if (!empty($_FILES['images'])) {
        $files = reindex_files($_FILES['images']);
        foreach ($files as $file) {
            if ($file['error'] === 0) {
                $ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
                $fname = time() . '_' . uniqid() . '.' . $ext;
                move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $fname);
                $pdo->prepare('INSERT INTO turf_images (turf_id, image_path) VALUES (?,?)')->execute([$turfId, UPLOAD_URL . $fname]);
            }
        }
    }

    $stmt = $pdo->prepare('SELECT t.*, u.name AS owner_name FROM turfs t JOIN users u ON t.owner_id=u.id WHERE t.id=?');
    $stmt->execute([$turfId]);
    $turf = decode_turf($pdo, $stmt->fetch());
    json_response($turf, 201);
}

// PUT /turfs/:id  — update turf (owner)
if ($method === 'PUT' && $id && !$sub) {
    $user = require_owner($pdo);
    $stmt = $pdo->prepare('SELECT * FROM turfs WHERE id=?');
    $stmt->execute([$id]);
    $turf = $stmt->fetch();
    if (!$turf) error_response('Turf not found', 404);
    if ($turf['owner_id'] != $user['id']) error_response('Not authorized', 403);

    $name    = trim($_POST['name'] ?? $turf['name']);
    $desc    = $_POST['description'] ?? $turf['description'];
    $loc     = $_POST['location'] ?? $turf['location'];
    $city    = $_POST['city'] ?? $turf['city'];
    $price   = (float)($_POST['pricePerHour'] ?? $turf['price_per_hour']);
    $contact = $_POST['contactNumber'] ?? $turf['contact_number'];
    $mapLink = $_POST['mapLink'] ?? $turf['map_link'];
    $slots   = $_POST['timeSlots'] ?? $turf['time_slots'];
    $pricing = $_POST['slotPricing'] ?? $turf['slot_pricing'];
    $amenities = $_POST['amenities'] ?? $turf['amenities'];

    if (is_string($slots) && !str_starts_with(trim($slots), '[')) $slots = json_encode(array_filter(explode(',', $slots)));
    if (is_string($amenities) && !str_starts_with(trim($amenities), '[')) $amenities = json_encode(array_filter(explode(',', $amenities)));

    $pdo->prepare('UPDATE turfs SET name=?,description=?,location=?,city=?,price_per_hour=?,contact_number=?,map_link=?,time_slots=?,slot_pricing=?,amenities=? WHERE id=?')
        ->execute([$name, $desc, $loc, $city, $price, $contact, $mapLink, $slots, $pricing, $amenities, $id]);

    // New images
    if (!empty($_FILES['images'])) {
        $files = reindex_files($_FILES['images']);
        foreach ($files as $file) {
            if ($file['error'] === 0) {
                $ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
                $fname = time() . '_' . uniqid() . '.' . $ext;
                move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $fname);
                $pdo->prepare('INSERT INTO turf_images (turf_id, image_path) VALUES (?,?)')->execute([$id, UPLOAD_URL . $fname]);
            }
        }
    }

    $stmt = $pdo->prepare('SELECT t.*, u.name AS owner_name FROM turfs t JOIN users u ON t.owner_id=u.id WHERE t.id=?');
    $stmt->execute([$id]);
    json_response(decode_turf($pdo, $stmt->fetch()));
}

// DELETE /turfs/:id
if ($method === 'DELETE' && $id && !$sub) {
    $user = require_owner($pdo);
    $stmt = $pdo->prepare('SELECT * FROM turfs WHERE id=?');
    $stmt->execute([$id]);
    $turf = $stmt->fetch();
    if (!$turf) error_response('Turf not found', 404);
    if ($turf['owner_id'] != $user['id']) error_response('Not authorized', 403);
    $pdo->prepare('DELETE FROM turfs WHERE id=?')->execute([$id]);
    json_response(['message' => 'Turf deleted']);
}

// POST /turfs/:id/reviews
if ($method === 'POST' && $id && $sub === 'reviews') {
    $user = require_auth($pdo);
    $b = get_body();
    $rating  = (int)($b['rating'] ?? 0);
    $comment = $b['comment'] ?? '';
    if ($rating < 1 || $rating > 5) error_response('Rating must be 1-5');

    $stmt = $pdo->prepare('SELECT id FROM turfs WHERE id=?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) error_response('Turf not found', 404);

    try {
        $pdo->prepare('INSERT INTO reviews (turf_id, user_id, name, rating, comment) VALUES (?,?,?,?,?)')
            ->execute([$id, $user['id'], $user['name'], $rating, $comment]);
    } catch (PDOException $e) {
        error_response('Already reviewed');
    }

    // Recalculate rating
    $stmt = $pdo->prepare('SELECT AVG(rating) AS avg_r, COUNT(*) AS cnt FROM reviews WHERE turf_id=?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    $pdo->prepare('UPDATE turfs SET rating=?, num_reviews=? WHERE id=?')
        ->execute([round($row['avg_r'], 2), $row['cnt'], $id]);

    json_response(['message' => 'Review added'], 201);
}

error_response('Not found', 404);

// ── Helpers ────────────────────────────────────────────────────────────────
function decode_turf(PDO $pdo, array $turf): array {
    $turf['time_slots']  = json_decode($turf['time_slots'] ?? '[]', true) ?? [];
    $turf['slot_pricing']= json_decode($turf['slot_pricing'] ?? '{}', true) ?? [];
    $turf['amenities']   = json_decode($turf['amenities'] ?? '[]', true) ?? [];

    $stmt = $pdo->prepare('SELECT image_path FROM turf_images WHERE turf_id=?');
    $stmt->execute([$turf['id']]);
    $turf['images'] = array_column($stmt->fetchAll(), 'image_path');

    $turf['owner'] = ['id' => $turf['owner_id'], 'name' => $turf['owner_name'] ?? '', 'email' => $turf['owner_email'] ?? '', 'phone' => $turf['owner_phone'] ?? ''];
    return $turf;
}

function reindex_files(array $files): array {
    $result = [];
    if (is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            $result[] = ['name' => $files['name'][$i], 'tmp_name' => $files['tmp_name'][$i], 'error' => $files['error'][$i]];
        }
    } else {
        $result[] = $files;
    }
    return $result;
}
