<?php
require_once __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

define('JWT_SECRET', 'pitchup_jwt_secret_change_in_production');
define('JWT_ALGO',   'HS256');
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('UPLOAD_URL', '/uploads/');

function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function error_response(string $message, int $status = 400): void {
    json_response(['message' => $message], $status);
}

function sign_token(int $id): string {
    $payload = ['id' => $id, 'iat' => time(), 'exp' => time() + 7 * 86400];
    return JWT::encode($payload, JWT_SECRET, JWT_ALGO);
}

function get_auth_user(PDO $pdo): ?array {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!str_starts_with($auth, 'Bearer ')) return null;
    $token = substr($auth, 7);
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, JWT_ALGO));
        $stmt = $pdo->prepare('SELECT id, name, email, role, phone, avatar FROM users WHERE id = ?');
        $stmt->execute([$decoded->id]);
        return $stmt->fetch() ?: null;
    } catch (Exception $e) {
        return null;
    }
}

function require_auth(PDO $pdo): array {
    $user = get_auth_user($pdo);
    if (!$user) error_response('Not authorized', 401);
    return $user;
}

function require_owner(PDO $pdo): array {
    $user = require_auth($pdo);
    if ($user['role'] !== 'owner') error_response('Owner access only', 403);
    return $user;
}

function get_body(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function purge_expired_locks(PDO $pdo): void {
    $pdo->exec("DELETE FROM slot_locks WHERE expires_at < NOW()");
}
