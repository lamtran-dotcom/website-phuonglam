<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

ensure_storage();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  send_json(['ok' => false, 'message' => 'Phương thức không hỗ trợ.'], 405);
}

require_admin();

if (empty($_FILES['image']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
  send_json(['ok' => false, 'message' => 'Chưa nhận được file ảnh.'], 422);
}

$file = $_FILES['image'];
if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
  send_json(['ok' => false, 'message' => 'Upload ảnh thất bại.'], 422);
}

$info = @getimagesize($file['tmp_name']);
if (!$info) {
  send_json(['ok' => false, 'message' => 'File không phải ảnh hợp lệ.'], 422);
}

$mime = $info['mime'] ?? '';
$extMap = [
  'image/jpeg' => 'jpg',
  'image/png' => 'png',
  'image/webp' => 'webp',
  'image/gif' => 'gif',
];
$ext = $extMap[$mime] ?? pathinfo($file['name'] ?? '', PATHINFO_EXTENSION);
$ext = strtolower(preg_replace('/[^a-z0-9]/', '', $ext ?: 'jpg'));
$name = date('YmdHis') . '-' . bin2hex(random_bytes(5)) . '.' . $ext;
$target = UPLOAD_DIR . '/' . $name;

if (!move_uploaded_file($file['tmp_name'], $target)) {
  send_json(['ok' => false, 'message' => 'Không thể lưu ảnh lên host. Kiểm tra quyền ghi thư mục uploads/products.'], 500);
}

send_json([
  'ok' => true,
  'url' => UPLOAD_URL_PREFIX . $name,
]);
