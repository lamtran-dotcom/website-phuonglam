<?php
declare(strict_types=1);

const ADMIN_PASSWORD = 'Lam29081998';
const DATA_DIR = __DIR__ . '/../data';
const PRODUCTS_FILE = DATA_DIR . '/products.json';
const SETTINGS_FILE = DATA_DIR . '/settings.json';
const ORDERS_FILE = DATA_DIR . '/orders.json';
const UPLOAD_DIR = __DIR__ . '/../uploads/products';
const UPLOAD_URL_PREFIX = 'uploads/products/';

function send_json($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function ensure_storage(): void {
  if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0755, true);
  if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
  if (!file_exists(PRODUCTS_FILE)) file_put_contents(PRODUCTS_FILE, "[]");
  if (!file_exists(SETTINGS_FILE)) file_put_contents(SETTINGS_FILE, json_encode(default_settings(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
  if (!file_exists(ORDERS_FILE)) file_put_contents(ORDERS_FILE, "[]");
}

function read_json_body(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function require_admin(): void {
  $password = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? ($_POST['password'] ?? '');
  if (!hash_equals(ADMIN_PASSWORD, (string)$password)) {
    send_json(['ok' => false, 'message' => 'Sai mật khẩu admin.'], 401);
  }
}

function default_settings(): array {
  return [
    'featuredIds' => [],
    'headerImages' => [],
    'categoryImages' => new stdClass(),
  ];
}

function read_json_file(string $path, $fallback) {
  ensure_storage();
  $raw = file_get_contents($path);
  $data = json_decode($raw ?: '', true);
  return is_array($data) ? $data : $fallback;
}

function write_json_file(string $path, $data): void {
  ensure_storage();
  $tmp = $path . '.tmp';
  file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX);
  rename($tmp, $path);
}

function read_products(): array {
  return read_json_file(PRODUCTS_FILE, []);
}

function write_products(array $products): void {
  write_json_file(PRODUCTS_FILE, array_values($products));
}

function read_settings(): array {
  $settings = read_json_file(SETTINGS_FILE, default_settings());
  return [
    'featuredIds' => is_array($settings['featuredIds'] ?? null) ? array_values($settings['featuredIds']) : [],
    'headerImages' => is_array($settings['headerImages'] ?? null) ? array_values($settings['headerImages']) : [],
    'categoryImages' => is_array($settings['categoryImages'] ?? null) ? $settings['categoryImages'] : [],
  ];
}

function write_settings(array $settings): void {
  write_json_file(SETTINGS_FILE, [
    'featuredIds' => is_array($settings['featuredIds'] ?? null) ? array_values($settings['featuredIds']) : [],
    'headerImages' => is_array($settings['headerImages'] ?? null) ? array_values($settings['headerImages']) : [],
    'categoryImages' => is_array($settings['categoryImages'] ?? null) ? $settings['categoryImages'] : [],
  ]);
}

function read_orders(): array {
  return read_json_file(ORDERS_FILE, []);
}

function write_orders(array $orders): void {
  write_json_file(ORDERS_FILE, array_values($orders));
}
