<?php
declare(strict_types=1);

const SETUP_KEY = 'phuonglam-setup-2026';

if (($_GET['key'] ?? '') !== SETUP_KEY) {
  header('Content-Type: text/html; charset=utf-8');
  echo '<h2>Setup Phương Lâm</h2>';
  echo '<p>Mở đường dẫn này để cài đặt:</p>';
  echo '<p><a href="?key=' . SETUP_KEY . '">Bấm để chạy setup</a></p>';
  echo '<p>Sau khi chạy xong, hãy xoá file <strong>setup-phuonglam.php</strong> khỏi host.</p>';
  exit;
}

$baseDir = __DIR__;
$errors = [];

function setup_mkdir(string $path, array &$errors): void {
  if (!is_dir($path) && !mkdir($path, 0755, true)) {
    $errors[] = 'Không tạo được thư mục: ' . $path;
    return;
  }
  @chmod($path, 0755);
}

function setup_write(string $path, string $content, array &$errors): void {
  $dir = dirname($path);
  setup_mkdir($dir, $errors);
  if (file_put_contents($path, $content, LOCK_EX) === false) {
    $errors[] = 'Không ghi được file: ' . $path;
    return;
  }
  @chmod($path, 0644);
}

setup_mkdir($baseDir . '/api', $errors);
setup_mkdir($baseDir . '/data', $errors);
setup_mkdir($baseDir . '/uploads', $errors);
setup_mkdir($baseDir . '/uploads/products', $errors);

setup_write($baseDir . '/api/config.php', <<<'CONFIGPHP'
<?php
declare(strict_types=1);

const ADMIN_PASSWORD = 'Lam29081998';
const DATA_DIR = __DIR__ . '/../data';
const PRODUCTS_FILE = DATA_DIR . '/products.json';
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

function read_products(): array {
  ensure_storage();
  $raw = file_get_contents(PRODUCTS_FILE);
  $data = json_decode($raw ?: '[]', true);
  return is_array($data) ? $data : [];
}

function write_products(array $products): void {
  ensure_storage();
  $tmp = PRODUCTS_FILE . '.tmp';
  file_put_contents($tmp, json_encode(array_values($products), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX);
  rename($tmp, PRODUCTS_FILE);
}
CONFIGPHP, $errors);

setup_write($baseDir . '/api/products.php', <<<'PRODUCTSPHP'
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
PRODUCTSPHP, $errors);

setup_write($baseDir . '/api/upload.php', <<<'UPLOADPHP'
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
UPLOADPHP, $errors);

setup_write($baseDir . '/data/products.json', <<<'PRODUCTSJSON'
[
  {
    "id": "1",
    "sku": "PL-001",
    "categoryId": "nen-thom",
    "name": "Nến tealight hộp 100v Loại 4h/viên - Mai",
    "price": 125000,
    "originalPrice": 155000,
    "shortDesc": "Hương hoa hồng và lavender dịu nhẹ, thư giãn tuyệt vời sau ngày dài làm việc.",
    "description": "Nến thơm được làm từ sáp đậu nành tự nhiên 100%, không chứa paraffin hay hóa chất độc hại. Hương hoa hồng kết hợp lavender tạo cảm giác thư giãn, giảm căng thẳng hiệu quả. Thời gian đốt lên đến 40 giờ.",
    "usage": "Đặt nến trên bề mặt phẳng, không cháy. Không để gần vật dễ cháy. Cắt tim nến 5mm trước khi thắp. Không để nến cháy quá 4 giờ liên tục.",
    "tag": "Bán chạy",
    "weight": 1200,
    "images": [],
    "reviews": [],
    "variants": [
      { "id": "variant_1776848693205_p4ov3", "name": "Vàng 4h", "sku": "", "price": 125000, "originalPrice": 200000, "weight": 1200, "image": "" },
      { "id": "variant_1776848705967_wanr8", "name": "Trắng 4h", "sku": "", "price": 130000, "originalPrice": 200000, "weight": 1200, "image": "" },
      { "id": "variant_1776848713550_oi6u7", "name": "Đỏ 4h", "sku": "", "price": 125000, "originalPrice": 200000, "weight": 1200, "image": "" }
    ]
  },
  {
    "id": "2",
    "sku": "PL-002",
    "categoryId": "nen-thom",
    "name": "Nến Tealight Vỏ Nhôm - cháy liêu tục 8 tiếng",
    "price": 9000,
    "originalPrice": 11000,
    "shortDesc": "Hương gỗ đàn hương ấm áp, sang trọng. Phù hợp cho phòng khách và phòng làm việc.",
    "description": "Được chiết xuất từ gỗ đàn hương Ấn Độ nguyên chất, tạo ra không gian ấm áp và sang trọng. Sáp đậu nành tự nhiên, cháy sạch không khói đen.",
    "usage": "Tương tự nến hoa hồng lavender.",
    "tag": "Nổi bật",
    "weight": 200,
    "images": [],
    "reviews": [],
    "variants": []
  },
  {
    "id": "3",
    "sku": "PL-003",
    "categoryId": "thao-moc-xong",
    "name": "Thảo mộc xông hơi ngải cứu",
    "price": 65000,
    "originalPrice": 80000,
    "shortDesc": "Ngải cứu sấy khô tự nhiên, thơm dịu, giúp lưu thông khí huyết và giảm đau nhức.",
    "description": "Ngải cứu được thu hoạch tự nhiên, sấy khô ở nhiệt độ thấp để giữ nguyên dưỡng chất. Kết hợp các loại thảo mộc truyền thống giúp xông hơi hiệu quả.",
    "usage": "Cho thảo mộc vào nồi nước sôi, xông 15–20 phút. Dùng 2–3 lần/tuần.",
    "tag": "Bán chạy",
    "weight": 150,
    "images": [],
    "reviews": [],
    "variants": []
  },
  {
    "id": "4",
    "sku": "PL-004",
    "categoryId": "thao-moc-xong",
    "name": "Thảo mộc xông sả gừng",
    "price": 55000,
    "originalPrice": null,
    "shortDesc": "Hương sả gừng tươi mát, kháng khuẩn tự nhiên, thích hợp dùng vào mùa lạnh.",
    "description": "Kết hợp sả và gừng tươi sấy khô, giúp làm ấm cơ thể, tăng sức đề kháng và xua đuổi vi khuẩn tự nhiên.",
    "usage": "Tương tự thảo mộc ngải cứu.",
    "tag": null,
    "weight": 150,
    "images": [],
    "reviews": [],
    "variants": []
  },
  {
    "id": "5",
    "sku": "PL-005",
    "categoryId": "bep-xong",
    "name": "Bếp xông gốm thủ công",
    "price": 185000,
    "originalPrice": 220000,
    "shortDesc": "Bếp gốm thủ công mỹ nghệ, dùng được cho cả nến tealight và than xông tinh dầu.",
    "description": "Làm từ đất sét nung truyền thống, mỗi sản phẩm là một tác phẩm thủ công độc đáo. Thiết kế thoáng, giúp hương toả đều trong không gian.",
    "usage": "Đặt nến tealight phía dưới, cho tinh dầu hoặc nước thơm vào bát phía trên.",
    "tag": "Nổi bật",
    "weight": null,
    "images": [],
    "reviews": [],
    "variants": []
  },
  {
    "id": "6",
    "sku": "PL-006",
    "categoryId": "combo",
    "name": "Combo thư giãn cuối tuần",
    "price": 265000,
    "originalPrice": 325000,
    "shortDesc": "Bộ combo gồm: 1 nến thơm lavender + 2 gói thảo mộc xông + 1 bếp xông gốm mini.",
    "description": "Combo tiết kiệm dành cho những ai muốn trải nghiệm trọn bộ sản phẩm chăm sóc sức khỏe tại nhà. Đóng hộp quà tặng sang trọng.",
    "usage": "Xem hướng dẫn của từng sản phẩm trong combo.",
    "tag": "Bán chạy",
    "weight": 800,
    "images": [],
    "reviews": [],
    "variants": []
  },
  {
    "id": "7",
    "sku": "PL-007",
    "categoryId": "phu-kien",
    "name": "Hột Quẹt Gas có thể kéo dài và thu gọn ",
    "price": 35000,
    "originalPrice": 40000,
    "shortDesc": "Chuyên dùng cho đốt nến xông, an toàn tiện lợi",
    "description": "Gốm trắng men bóng, dễ lau chùi. Phù hợp với mọi loại nến đường kính dưới 10cm.",
    "usage": "Đặt nến lên đĩa trước khi thắp.",
    "tag": "Nổi bật",
    "weight": 200,
    "images": [],
    "reviews": [],
    "variants": []
  },
  {
    "id": "8",
    "sku": "PL-008",
    "categoryId": "phu-kien",
    "name": "Nắp lẻ dùng cho bếp niêu xông",
    "price": 0,
    "originalPrice": null,
    "shortDesc": "Dụng cụ cắt tim nến chuyên dụng bằng inox, giúp nến cháy đều và sạch hơn.",
    "description": "Inox 304 không gỉ, thiết kế ergonomic dễ cầm. Cắt tim nến đúng cách giúp nến thơm tỏa hương đều và kéo dài tuổi thọ.",
    "usage": "Cắt tim nến xuống còn 5mm trước mỗi lần thắp.",
    "tag": null,
    "weight": 222,
    "images": [],
    "reviews": [],
    "variants": [
      { "id": "variant_1776857811016_w39o2", "name": "Nắp lẻ sz 13", "sku": "", "price": 20000, "originalPrice": 40000, "weight": null, "image": "" },
      { "id": "variant_1776857812866_96ku7", "name": "Nắp lẻ sz 16", "sku": "", "price": 25000, "originalPrice": 40000, "weight": null, "image": "" }
    ]
  },
  {
    "id": "new_1776824123777",
    "sku": "PL-3777",
    "categoryId": "nen-ly",
    "name": "Nến Ly nơ đại",
    "price": 55,
    "originalPrice": 55,
    "shortDesc": "22",
    "description": "22",
    "usage": "22",
    "tag": "Mới",
    "weight": 2222,
    "images": [],
    "reviews": [],
    "variants": []
  },
  {
    "id": "new_1776857397825",
    "sku": "PL-7825",
    "categoryId": "nen-thom",
    "name": "Nến Tealight 4h hộp 100v - Loại 4h",
    "price": 140000,
    "originalPrice": 250000,
    "shortDesc": "",
    "description": "",
    "usage": "",
    "tag": "Bán chạy",
    "weight": 1200,
    "images": [],
    "reviews": [],
    "variants": []
  },
  {
    "id": "new_1776857467847",
    "sku": "PL-7847",
    "categoryId": "nu-tram",
    "name": "Nụ Trầm",
    "price": 22,
    "originalPrice": null,
    "shortDesc": "",
    "description": "",
    "usage": "",
    "tag": null,
    "weight": 500,
    "images": [],
    "reviews": [],
    "variants": [
      { "id": "variant_1776857499133_4s0di", "name": "Hộp 40 Viên Nụ", "sku": "", "price": 100000, "originalPrice": null, "weight": null, "image": "" },
      { "id": "variant_1776857499597_nob4c", "name": "Hộp 65 Viên Nụ", "sku": "", "price": 200000, "originalPrice": null, "weight": null, "image": "" }
    ]
  },
  {
    "id": "new_1776858940282",
    "sku": "PL-0282",
    "categoryId": "phu-kien",
    "name": "Phụ Kiên Xông Với Bếp Niêu",
    "price": 30000,
    "originalPrice": null,
    "shortDesc": "",
    "description": "",
    "usage": "",
    "tag": null,
    "weight": null,
    "images": [],
    "reviews": [],
    "variants": []
  }
]
PRODUCTSJSON, $errors);

header('Content-Type: text/html; charset=utf-8');
echo '<!doctype html><meta charset="utf-8"><title>Setup Phương Lâm</title>';
echo '<body style="font-family:Arial,sans-serif;max-width:760px;margin:40px auto;line-height:1.6">';

if ($errors) {
  echo '<h2 style="color:#c62828">Setup chưa hoàn tất</h2><ul>';
  foreach ($errors as $error) {
    echo '<li>' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8') . '</li>';
  }
  echo '</ul><p>Thử đổi quyền thư mục <strong>public_html</strong> sang 755 hoặc liên hệ host để bật quyền ghi file.</p>';
} else {
  echo '<h2 style="color:#2e7d32">Setup thành công</h2>';
  echo '<p>Đã tạo xong:</p>';
  echo '<ul><li>api/config.php</li><li>api/products.php</li><li>api/upload.php</li><li>data/products.json</li><li>uploads/products/</li></ul>';
  echo '<p>Tiếp theo mở: <a href="admin-upload.html">admin-upload.html</a></p>';
  echo '<p style="color:#c62828"><strong>Quan trọng:</strong> hãy xoá file setup-phuonglam.php sau khi cài xong.</p>';
}

echo '</body>';
