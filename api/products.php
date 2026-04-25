<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

ensure_storage();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  send_json(['ok' => true, 'products' => read_products()]);
}

if ($method === 'POST') {
  require_admin();
  $body = read_json_body();
  $products = $body['products'] ?? null;
  if (!is_array($products)) {
    send_json(['ok' => false, 'message' => 'Dữ liệu sản phẩm không hợp lệ.'], 422);
  }
  write_products($products);
  send_json(['ok' => true, 'products' => read_products()]);
}

send_json(['ok' => false, 'message' => 'Phương thức không hỗ trợ.'], 405);
