<?php
// $method, $id, $sub, $pdo are available from index.php

$action = $id; // e.g. 'login', 'register', 'me', 'forgot-password'

if ($method === 'POST' && $action === 'register') {
    $b = get_body();
    $name  = trim($b['name'] ?? '');
    $email = strtolower(trim($b['email'] ?? ''));
    $pass  = $b['password'] ?? '';
    $role  = in_array($b['role'] ?? '', ['player','owner']) ? $b['role'] : 'player';
    $phone = $b['phone'] ?? null;

    if (!$name || !$email || !$pass) error_response('name, email and password are required');

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) error_response('Email already registered');

    $hash = password_hash($pass, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password, role, phone) VALUES (?,?,?,?,?)');
    $stmt->execute([$name, $email, $hash, $role, $phone]);
    $userId = $pdo->lastInsertId();

    $token = sign_token($userId);
    json_response(['token' => $token, 'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => $role, 'phone' => $phone]], 201);
}

if ($method === 'POST' && $action === 'login') {
    $b = get_body();
    $email = strtolower(trim($b['email'] ?? ''));
    $pass  = $b['password'] ?? '';

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password']))
        error_response('Invalid credentials', 401);

    $token = sign_token($user['id']);
    json_response(['token' => $token, 'user' => [
        'id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'],
        'role' => $user['role'], 'phone' => $user['phone'],
    ]]);
}

if ($method === 'GET' && $action === 'me') {
    $user = require_auth($pdo);
    json_response($user);
}

if ($method === 'POST' && $action === 'forgot-password') {
    $b = get_body();
    $email = strtolower(trim($b['email'] ?? ''));
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    // Always respond 200 to avoid email enumeration
    if (!$user) json_response(['message' => 'If that email exists, a reset link has been sent.']);

    $rawToken = bin2hex(random_bytes(32));
    $hashed   = hash('sha256', $rawToken);
    $expire   = date('Y-m-d H:i:s', time() + 15 * 60);

    $pdo->prepare('UPDATE users SET reset_password_token=?, reset_password_expire=? WHERE id=?')
        ->execute([$hashed, $expire, $user['id']]);

    $resetUrl = 'http://localhost/reset-password.html?token=' . $rawToken;
    // Send email if PHPMailer is available
    try {
        require_once __DIR__ . '/../mailer.php';
        send_email($email, 'Reset your PitchUp password',
            "<p>Click <a href='$resetUrl'>here</a> to reset your password. Link expires in 15 minutes.</p>");
    } catch (Exception $e) { /* silently fail if mailer not configured */ }

    json_response(['message' => 'If that email exists, a reset link has been sent.']);
}

if ($method === 'PUT' && $action === 'reset-password' && $sub) {
    $rawToken = $sub;
    $hashed   = hash('sha256', $rawToken);
    $stmt = $pdo->prepare('SELECT * FROM users WHERE reset_password_token=? AND reset_password_expire > NOW()');
    $stmt->execute([$hashed]);
    $user = $stmt->fetch();
    if (!$user) error_response('Invalid or expired token', 400);

    $b    = get_body();
    $pass = $b['password'] ?? '';
    if (strlen($pass) < 6) error_response('Password must be at least 6 characters');

    $hash = password_hash($pass, PASSWORD_BCRYPT, ['cost' => 12]);
    $pdo->prepare('UPDATE users SET password=?, reset_password_token=NULL, reset_password_expire=NULL WHERE id=?')
        ->execute([$hash, $user['id']]);

    $token = sign_token($user['id']);
    json_response(['token' => $token, 'user' => [
        'id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'],
        'role' => $user['role'], 'phone' => $user['phone'],
    ]]);
}

error_response('Not found', 404);
