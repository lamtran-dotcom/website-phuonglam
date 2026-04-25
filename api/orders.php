<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

ensure_storage();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  require_admin();
  send_json(['ok' => true, 'orders' => read_orders()]);
}

if ($method === 'POST') {
  $body = read_json_body();
  $action = $body['action'] ?? 'create';
  $orders = read_orders();

  if ($action === 'create') {
    $order = is_array($body['order'] ?? null) ? $body['order'] : [];
    $order['id'] = $order['id'] ?? ('PL' . date('ymdHis') . random_int(10, 99));
    $order['status'] = $order['status'] ?? 'New';
    $order['date'] = $order['date'] ?? date('d/m/Y H:i');
    array_unshift($orders, $order);
    write_orders($orders);
    send_json(['ok' => true, 'order' => $order]);
  }

  require_admin();

  if ($action === 'updateStatus') {
    $id = (string)($body['id'] ?? '');
    $status = (string)($body['status'] ?? '');
    $allowed = ['New', 'Processing', 'Done', 'Cancelled'];
    if (!$id || !in_array($status, $allowed, true)) {
      send_json(['ok' => false, 'message' => 'Dữ liệu cập nhật đơn hàng không hợp lệ.'], 422);
    }
    foreach ($orders as &$order) {
      if ((string)($order['id'] ?? '') === $id) {
        $order['status'] = $status;
        break;
      }
    }
    unset($order);
    write_orders($orders);
    send_json(['ok' => true, 'orders' => read_orders()]);
  }

  send_json(['ok' => false, 'message' => 'Hành động không hỗ trợ.'], 405);
}

send_json(['ok' => false, 'message' => 'Phương thức không hỗ trợ.'], 405);
