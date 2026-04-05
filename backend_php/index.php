<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Strip /api prefix if present
$uri = preg_replace('#^/api#', '', $uri);
$uri = rtrim($uri, '/') ?: '/';
$segments = explode('/', ltrim($uri, '/'));

$resource = $segments[0] ?? '';
$id       = $segments[1] ?? null;
$sub      = $segments[2] ?? null;
$subId    = $segments[3] ?? null;

// Handle nested routes: /turfs/:id/boxes and /turfs/:id/availability
if ($resource === 'turfs' && $id && is_numeric($id) && $sub === 'boxes') {
    $turfId = $id;
    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT * FROM boxes WHERE turf_id=? AND is_active=1');
        $stmt->execute([$turfId]);
        $boxes = $stmt->fetchAll();
        foreach ($boxes as &$b) $b['time_slots'] = json_decode($b['time_slots'] ?? '[]', true);
        json_response($boxes);
    }
    if ($method === 'POST') {
        $user = require_owner($pdo);
        $stmt = $pdo->prepare('SELECT * FROM turfs WHERE id=?');
        $stmt->execute([$turfId]);
        $turf = $stmt->fetch();
        if (!$turf) error_response('Turf not found', 404);
        if ($turf['owner_id'] != $user['id']) error_response('Not authorized', 403);

        $b = get_body();
        $name  = $b['name'] ?? '';
        $desc  = $b['description'] ?? null;
        $slots = isset($b['timeSlots']) ? json_encode($b['timeSlots']) : $turf['time_slots'];

        $pdo->prepare('INSERT INTO boxes (turf_id, name, description, time_slots) VALUES (?,?,?,?)')
            ->execute([$turfId, $name, $desc, $slots]);
        $boxId = $pdo->lastInsertId();

        $stmt = $pdo->prepare('SELECT * FROM boxes WHERE id=?');
        $stmt->execute([$boxId]);
        $box = $stmt->fetch();
        $box['time_slots'] = json_decode($box['time_slots'] ?? '[]', true);
        json_response($box, 201);
    }
    error_response('Not found', 404);
}

switch ($resource) {
    case 'auth':          require __DIR__ . '/routes/auth.php';          break;
    case 'turfs':         require __DIR__ . '/routes/turfs.php';         break;
    case 'boxes':         require __DIR__ . '/routes/boxes.php';         break;
    case 'bookings':      require __DIR__ . '/routes/bookings.php';      break;
    case 'matches':       require __DIR__ . '/routes/matches.php';       break;
    case 'notifications': require __DIR__ . '/routes/notifications.php'; break;
    case 'health':        json_response(['status' => 'ok', 'message' => 'QuickBox API running']); break;
    default:              error_response('Not found', 404);
}
