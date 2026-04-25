<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

ensure_storage();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  send_json(['ok' => true, 'settings' => read_settings()]);
}

if ($method === 'POST') {
  require_admin();
  $body = read_json_body();
  $settings = $body['settings'] ?? null;
  if (!is_array($settings)) {
    send_json(['ok' => false, 'message' => 'Dữ liệu cài đặt không hợp lệ.'], 422);
  }
  write_settings($settings);
  send_json(['ok' => true, 'settings' => read_settings()]);
}

send_json(['ok' => false, 'message' => 'Phương thức không hỗ trợ.'], 405);
