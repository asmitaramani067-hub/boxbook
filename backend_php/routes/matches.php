<?php
// Auto-expire past open matches
$today   = date('Y-m-d');
$nowTime = date('H:i');
$pdo->prepare("UPDATE matches SET status='cancelled' WHERE status='open' AND (date < ? OR (date = ? AND time < ?))")
    ->execute([$today, $today, $nowTime]);

// GET /matches
if ($method === 'GET' && !$id) {
    $city   = $_GET['city'] ?? '';
    $date   = $_GET['date'] ?? '';
    $status = $_GET['status'] ?? '';
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = 12;
    $offset = ($page - 1) * $limit;

    $where  = ['1=1'];
    $params = [];
    if ($city)   { $where[] = 'm.city LIKE ?';   $params[] = "%$city%"; }
    if ($date)   { $where[] = 'm.date = ?';       $params[] = $date; }
    if ($status) { $where[] = 'm.status = ?';     $params[] = $status; }

    $whereStr = implode(' AND ', $where);

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM matches m WHERE $whereStr");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("SELECT m.*, u.name AS creator_name FROM matches m JOIN users u ON m.created_by=u.id WHERE $whereStr ORDER BY m.date ASC, m.time ASC LIMIT $limit OFFSET $offset");
    $stmt->execute($params);
    $matches = $stmt->fetchAll();

    foreach ($matches as &$match) {
        $match = enrich_match($pdo, $match);
    }

    json_response(['matches' => $matches, 'total' => $total, 'pages' => ceil($total / $limit)]);
}

// GET /matches/:id
if ($method === 'GET' && $id && !$sub) {
    $stmt = $pdo->prepare('SELECT m.*, u.name AS creator_name, u.phone AS creator_phone FROM matches m JOIN users u ON m.created_by=u.id WHERE m.id=?');
    $stmt->execute([$id]);
    $match = $stmt->fetch();
    if (!$match) error_response('Match not found', 404);
    json_response(enrich_match($pdo, $match));
}

// POST /matches
if ($method === 'POST' && !$id) {
    $user = require_auth($pdo);
    $b = get_body();
    $title   = trim($b['title'] ?? '');
    $city    = trim($b['city'] ?? '');
    $loc     = $b['location'] ?? null;
    $date    = $b['date'] ?? null;
    $time    = $b['time'] ?? null;
    $type    = in_array($b['matchType'] ?? '', ['Box Cricket','Open Ground']) ? $b['matchType'] : 'Box Cricket';
    $needed  = (int)($b['totalPlayersNeeded'] ?? 0);
    $desc    = $b['description'] ?? null;

    if (!$title || !$city || !$date || !$time || $needed < 1) error_response('Missing required fields');

    $pdo->prepare('INSERT INTO matches (created_by, title, city, location, date, time, match_type, total_players_needed, description) VALUES (?,?,?,?,?,?,?,?,?)')
        ->execute([$user['id'], $title, $city, $loc, $date, $time, $type, $needed, $desc]);
    $matchId = $pdo->lastInsertId();

    // Creator auto-joins
    $pdo->prepare('INSERT INTO match_players (match_id, user_id) VALUES (?,?)')->execute([$matchId, $user['id']]);

    $stmt = $pdo->prepare('SELECT m.*, u.name AS creator_name FROM matches m JOIN users u ON m.created_by=u.id WHERE m.id=?');
    $stmt->execute([$matchId]);
    json_response(enrich_match($pdo, $stmt->fetch()), 201);
}

// POST /matches/:id/join
if ($method === 'POST' && $id && $sub === 'join') {
    $user = require_auth($pdo);
    $stmt = $pdo->prepare('SELECT * FROM matches WHERE id=?');
    $stmt->execute([$id]);
    $match = $stmt->fetch();
    if (!$match) error_response('Match not found', 404);
    if ($match['status'] === 'cancelled') error_response('Match is cancelled');
    if ($match['status'] === 'full') error_response('Match is already full');

    $stmt = $pdo->prepare('SELECT id FROM match_players WHERE match_id=? AND user_id=?');
    $stmt->execute([$id, $user['id']]);
    if ($stmt->fetch()) error_response('You already joined this match');

    $pdo->prepare('INSERT INTO match_players (match_id, user_id) VALUES (?,?)')->execute([$id, $user['id']]);

    // Update status if full
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM match_players WHERE match_id=?');
    $stmt->execute([$id]);
    $count = (int)$stmt->fetchColumn();
    if ($count >= $match['total_players_needed']) {
        $pdo->prepare("UPDATE matches SET status='full' WHERE id=?")->execute([$id]);
    }

    $stmt = $pdo->prepare('SELECT m.*, u.name AS creator_name FROM matches m JOIN users u ON m.created_by=u.id WHERE m.id=?');
    $stmt->execute([$id]);
    json_response(enrich_match($pdo, $stmt->fetch()));
}

// DELETE /matches/:id/join  — leave match
if ($method === 'DELETE' && $id && $sub === 'join') {
    $user = require_auth($pdo);
    $stmt = $pdo->prepare('SELECT * FROM matches WHERE id=?');
    $stmt->execute([$id]);
    $match = $stmt->fetch();
    if (!$match) error_response('Match not found', 404);
    if ($match['created_by'] == $user['id']) error_response('Creator cannot leave. Cancel the match instead.');

    $pdo->prepare('DELETE FROM match_players WHERE match_id=? AND user_id=?')->execute([$id, $user['id']]);

    // Reopen if was full
    if ($match['status'] === 'full') {
        $pdo->prepare("UPDATE matches SET status='open' WHERE id=?")->execute([$id]);
    }
    json_response(['message' => 'Left match successfully']);
}

// DELETE /matches/:id  — cancel match (creator only)
if ($method === 'DELETE' && $id && !$sub) {
    $user = require_auth($pdo);
    $stmt = $pdo->prepare('SELECT * FROM matches WHERE id=?');
    $stmt->execute([$id]);
    $match = $stmt->fetch();
    if (!$match) error_response('Match not found', 404);
    if ($match['created_by'] != $user['id']) error_response('Only the creator can cancel this match', 403);
    $pdo->prepare("UPDATE matches SET status='cancelled' WHERE id=?")->execute([$id]);
    json_response(['message' => 'Match cancelled']);
}

error_response('Not found', 404);

function enrich_match(PDO $pdo, array $match): array {
    $stmt = $pdo->prepare('SELECT mp.user_id, u.name AS user_name, mp.joined_at FROM match_players mp JOIN users u ON mp.user_id=u.id WHERE mp.match_id=?');
    $stmt->execute([$match['id']]);
    $players = $stmt->fetchAll();
    $match['players'] = array_map(fn($p) => ['user' => ['id' => $p['user_id'], 'name' => $p['user_name']], 'joinedAt' => $p['joined_at']], $players);
    $match['createdBy'] = ['id' => $match['created_by'], 'name' => $match['creator_name'], 'phone' => $match['creator_phone'] ?? null];
    $match['totalPlayersNeeded'] = (int)$match['total_players_needed'];
    return $match;
}
