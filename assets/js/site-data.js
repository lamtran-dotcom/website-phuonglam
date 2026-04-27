const CATEGORIES = [
  { id: 'nen-thom', name: 'Nến Xông', from: '85.000đ', icon: '🕯️' },
  { id: 'combo', name: 'Combo Xông Nhà', from: '199.000đ', icon: '🎁' },
  { id: 'thao-moc-xong', name: 'Thảo Mộc Xông', from: '45.000đ', icon: '🌿' },
  { id: 'bep-xong', name: 'Đèn Xông Tinh Dầu', from: '120.000đ', icon: '🔥' },
  { id: 'nen-tru', name: 'Nến Trụ', from: '55.000đ', icon: '🕯' },
  { id: 'nu-tram', name: 'Nụ Trầm', from: '35.000đ', icon: '🌸' },
  { id: 'phu-kien', name: 'Phụ Kiện Xông', from: '25.000đ', icon: '✨' },
  { id: 'nen-ly', name: 'Nến Ly', from: '65.000đ', icon: '🫙' },
];

const PRODUCTS = [
  {
    id: 1, sku: 'PL-001', categoryId: 'nen-thom',
    name: 'Nến tealight 4 giờ Phương Lâm trang trí thư giãn không khói',
    price: 125000, originalPrice: 155000,
    shortDesc: 'Hương hoa hồng và lavender dịu nhẹ, thư giãn tuyệt vời sau ngày dài làm việc.',
    description: 'Nến thơm được làm từ sáp đậu nành tự nhiên 100%, không chứa paraffin hay hóa chất độc hại. Hương hoa hồng kết hợp lavender tạo cảm giác thư giãn, giảm căng thẳng hiệu quả. Thời gian đốt lên đến 40 giờ.',
    usage: 'Đặt nến trên bề mặt phẳng, không cháy. Không để gần vật dễ cháy. Cắt tim nến 5mm trước khi thắp. Không để nến cháy quá 4 giờ liên tục.',
    tag: 'Bán chạy', weight: 200,
    reviews: [
      { name: 'Nguyễn Thị Mai', rating: 5, comment: 'Mùi rất dễ chịu, đốt cả buổi tối không bị ngột. Sẽ mua lại!' },
      { name: 'Trần Văn Hùng', rating: 5, comment: 'Sản phẩm đẹp, đóng gói cẩn thận. Hương thơm tự nhiên không hắc.' },
      { name: 'Lê Thu Hà', rating: 4, comment: 'Rất thích, chỉ tiếc hơi nhỏ hơn mình nghĩ.' },
    ]
  },
  {
    id: 2, sku: 'PL-002', categoryId: 'nen-thom',
    name: 'Nến tealight 8 giờ vỏ nhôm xông tinh dầu không mùi',
    price: 145000, originalPrice: null,
    shortDesc: 'Hương gỗ đàn hương ấm áp, sang trọng. Phù hợp cho phòng khách và phòng làm việc.',
    description: 'Được chiết xuất từ gỗ đàn hương Ấn Độ nguyên chất, tạo ra không gian ấm áp và sang trọng. Sáp đậu nành tự nhiên, cháy sạch không khói đen.',
    usage: 'Tương tự nến hoa hồng lavender.',
    tag: 'Nổi bật', weight: 500, weight: 200,
    reviews: [
      { name: 'Phạm Minh Khoa', rating: 5, comment: 'Hương rất đặc trưng, không bị ngấy. Phòng khách nhà mình thơm cả tuần.' },
    ]
  },
  {
    id: 3, sku: 'PL-003', categoryId: 'thao-moc-xong',
    name: 'Thảo mộc ngải cứu xông hơi thư giãn thơm dịu tự nhiên',
    price: 65000, originalPrice: 80000,
    shortDesc: 'Ngải cứu sấy khô tự nhiên, thơm dịu, giúp lưu thông khí huyết và giảm đau nhức.',
    description: 'Ngải cứu được thu hoạch tự nhiên, sấy khô ở nhiệt độ thấp để giữ nguyên dưỡng chất. Kết hợp các loại thảo mộc truyền thống giúp xông hơi hiệu quả.',
    usage: 'Cho thảo mộc vào nồi nước sôi, xông 15–20 phút. Dùng 2–3 lần/tuần.',
    tag: 'Bán chạy', weight: 150,
    reviews: [
      { name: 'Hoàng Thị Lan', rating: 5, comment: 'Xông xong người nhẹ hẳn, ngủ ngon hơn hẳn. Rất hài lòng!' },
    ]
  },
  {
    id: 4, sku: 'PL-004', categoryId: 'thao-moc-xong',
    name: 'Thảo mộc sả gừng xông nhà khử mùi làm ấm tự nhiên',
    price: 55000, originalPrice: null,
    shortDesc: 'Hương sả gừng tươi mát, kháng khuẩn tự nhiên, thích hợp dùng vào mùa lạnh.',
    description: 'Kết hợp sả và gừng tươi sấy khô, giúp làm ấm cơ thể, tăng sức đề kháng và xua đuổi vi khuẩn tự nhiên.',
    usage: 'Tương tự thảo mộc ngải cứu.',
    tag: null, weight: 150,
    reviews: []
  },
  {
    id: 5, sku: 'PL-005', categoryId: 'bep-xong',
    name: 'Bếp xông gốm thủ công dùng nến tỏa hương đều sang trọng',
    price: 185000, originalPrice: 220000,
    shortDesc: 'Bếp gốm thủ công mỹ nghệ, dùng được cho cả nến tealight và than xông tinh dầu.',
    description: 'Làm từ đất sét nung truyền thống, mỗi sản phẩm là một tác phẩm thủ công độc đáo. Thiết kế thoáng, giúp hương toả đều trong không gian.',
    usage: 'Đặt nến tealight phía dưới, cho tinh dầu hoặc nước thơm vào bát phía trên.',
    tag: 'Nổi bật',
    reviews: [
      { name: 'Vũ Thị Bích', rating: 5, comment: 'Đẹp lắm, trưng phòng khách sang hẳn. Chất lượng xuất sắc!' },
    ]
  },
  {
    id: 6, sku: 'PL-006', categoryId: 'combo',
    name: 'Combo xông nhà thư giãn cuối tuần đủ món tiện dùng Phương Lâm',
    price: 265000, originalPrice: 325000,
    shortDesc: 'Bộ combo gồm: 1 nến thơm lavender + 2 gói thảo mộc xông + 1 bếp xông gốm mini.',
    description: 'Combo tiết kiệm dành cho những ai muốn trải nghiệm trọn bộ sản phẩm chăm sóc sức khỏe tại nhà. Đóng hộp quà tặng sang trọng.',
    usage: 'Xem hướng dẫn của từng sản phẩm trong combo.',
    tag: 'Bán chạy', weight: 800,
    reviews: [
      { name: 'Đinh Thị Nga', rating: 5, comment: 'Mua làm quà tặng bạn, được khen xinh lắm. Đóng gói rất đẹp!' },
      { name: 'Cao Minh Tú', rating: 5, comment: 'Giá tốt hơn mua lẻ nhiều. Chất lượng không thua kém.' },
    ]
  },
  {
    id: 7, sku: 'PL-007', categoryId: 'phu-kien',
    name: 'Hột quẹt gas thắp nến đầu dài an toàn nhỏ gọn tiện lợi',
    price: 35000, originalPrice: null,
    shortDesc: 'Đĩa lót nến gốm trắng tinh, bảo vệ bàn khỏi sáp chảy.',
    description: 'Gốm trắng men bóng, dễ lau chùi. Phù hợp với mọi loại nến đường kính dưới 10cm.',
    usage: 'Đặt nến lên đĩa trước khi thắp.',
    tag: null, weight: 200,
    reviews: []
  },
  {
    id: 8, sku: 'PL-008', categoryId: 'phu-kien',
    name: 'Nắp bếp niêu xông thảo mộc đất nung giữ hương tiện thay thế',
    price: 45000, originalPrice: null,
    shortDesc: 'Dụng cụ cắt tim nến chuyên dụng bằng inox, giúp nến cháy đều và sạch hơn.',
    description: 'Inox 304 không gỉ, thiết kế ergonomic dễ cầm. Cắt tim nến đúng cách giúp nến thơm tỏa hương đều và kéo dài tuổi thọ.',
    usage: 'Cắt tim nến xuống còn 5mm trước mỗi lần thắp.',
    tag: null, weight: 80,
    reviews: []
  },
];

const BLOG_POSTS = [
  {
    id: 11,
    title: 'Hướng dẫn dùng bếp xông thảo mộc đúng cách, an toàn',
    excerpt: 'Bếp xông thảo mộc giúp thanh lọc không khí, khử mùi ẩm mốc và thư giãn tinh thần. Hướng dẫn cách dùng đúng cách cùng nến tealight và thảo mộc tự nhiên.',
    date: '26 tháng 4, 2026',
    readTime: '5 phút đọc',
    slug: 'huong-dan-dung-bep-xong-thao-moc',
    tag: 'Hướng dẫn',
  },
  {
    id: 10,
    title: 'Phân biệt nến 2h, nến 4h, nến 8h dùng cho mục đích gì',
    excerpt: 'Hiểu rõ sự khác nhau giữa nến tealight 2h, 4h và 8h để chọn đúng loại cho bàn thờ, xông tinh dầu, trang trí hoặc những buổi thư giãn dài.',
    date: '25 tháng 4, 2025',
    readTime: '6 phút đọc',
    slug: 'phan-biet-nen-tealight-nen-2h-4h-8h',
    tag: 'Hướng dẫn',
  },
  {
    id: 1,
    title: 'Cách xông thảo mộc đúng cách để đạt hiệu quả tối đa',
    excerpt: 'Xông thảo mộc là phương pháp chăm sóc sức khỏe truyền thống được áp dụng hàng ngàn năm nay. Nhưng làm thế nào để xông đúng cách và an toàn nhất?',
    date: '15 tháng 4, 2025',
    readTime: '5 phút đọc',
    slug: 'cach-xong-thao-moc-dung-cach',
    tag: 'Hướng dẫn',
  },
  {
    id: 2,
    title: 'Nến tealight xông nhà — Cách dùng đúng và an toàn',
    excerpt: 'Nến tealight nhỏ nhưng có công dụng lớn khi kết hợp với bếp xông tinh dầu. Hướng dẫn chi tiết cách đặt, thời gian đốt và những lưu ý an toàn.',
    date: '10 tháng 4, 2025',
    readTime: '4 phút đọc',
    slug: 'nen-tealight-xong-nha-cach-dung',
    tag: 'Hướng dẫn',
  },
  {
    id: 3,
    title: 'Top 5 thảo mộc xông hơi tốt nhất cho mùa đông',
    excerpt: 'Mùa đông lạnh là thời điểm lý tưởng để xông thảo mộc. Ngải cứu, sả gừng, bạc hà... loại nào phù hợp với bạn?',
    date: '1 tháng 4, 2025',
    readTime: '6 phút đọc',
    slug: 'top-5-thao-moc-xong-mua-dong',
    tag: 'Kiến thức',
  },
  {
    id: 4,
    title: 'Xông nhà bằng thảo mộc có thật sự diệt khuẩn không?',
    excerpt: 'Nhiều người xông nhà với hy vọng diệt khuẩn và khử mùi. Bài viết này phân tích khoa học đằng sau tác dụng kháng khuẩn của các loại thảo mộc tự nhiên.',
    date: '25 tháng 3, 2025',
    readTime: '7 phút đọc',
    slug: 'xong-nha-thao-moc-co-diet-khuan-khong',
    tag: 'Kiến thức',
  },
  {
    id: 5,
    title: 'Combo xông nhà cho người mới bắt đầu — Cần chuẩn bị gì?',
    excerpt: 'Bạn muốn thử xông nhà bằng thảo mộc nhưng chưa biết bắt đầu từ đâu? Bài viết này hướng dẫn bạn từng bước, từ dụng cụ đến nguyên liệu cần thiết.',
    date: '18 tháng 3, 2025',
    readTime: '5 phút đọc',
    slug: 'combo-xong-nha-cho-nguoi-moi',
    tag: 'Hướng dẫn',
  },
  {
    id: 6,
    title: 'Ngải cứu xông hơi — Tác dụng, cách dùng và lưu ý',
    excerpt: 'Ngải cứu là vị thuốc dân gian quen thuộc trong y học cổ truyền. Tìm hiểu cách xông ngải cứu đúng cách để trị đau nhức, cảm cúm và mệt mỏi.',
    date: '10 tháng 3, 2025',
    readTime: '6 phút đọc',
    slug: 'ngai-cuu-xong-hoi-tac-dung-cach-dung',
    tag: 'Thảo mộc',
  },
  {
    id: 7,
    title: 'Sả gừng xông nhà — Hương thơm thiên nhiên đuổi muỗi hiệu quả',
    excerpt: 'Sả và gừng không chỉ là gia vị trong bếp mà còn là bộ đôi hoàn hảo để xông nhà, đuổi muỗi và tạo không khí trong lành tự nhiên.',
    date: '3 tháng 3, 2025',
    readTime: '4 phút đọc',
    slug: 'sa-gung-xong-nha-duoi-muoi',
    tag: 'Thảo mộc',
  },
  {
    id: 8,
    title: 'Bếp xông tinh dầu gốm — Loại nào tốt nhất hiện nay?',
    excerpt: 'Thị trường có nhiều loại bếp xông: gốm, đất nung, inox... Bài viết này so sánh ưu nhược điểm từng loại để bạn chọn đúng sản phẩm phù hợp.',
    date: '22 tháng 2, 2025',
    readTime: '5 phút đọc',
    slug: 'bep-xong-tinh-dau-gom-loai-nao-tot',
    tag: 'Phụ kiện',
  },
  {
    id: 9,
    title: 'Xông thảo mộc sau sinh — Lợi ích và những điều cần biết',
    excerpt: 'Xông thảo mộc sau sinh là phong tục truyền thống của nhiều vùng miền Việt Nam. Tìm hiểu lợi ích thực sự và các lưu ý quan trọng cho mẹ bầu.',
    date: '14 tháng 2, 2025',
    readTime: '8 phút đọc',
    slug: 'xong-thao-moc-sau-sinh-loi-ich',
    tag: 'Sức khỏe',
  },
];

const BLOG_ARTICLES = {
  'huong-dan-dung-bep-xong-thao-moc': {
    intro: 'Phòng ngủ có mùi nồm ẩm sau mưa dài? Không gian sống thiếu hương thơm dễ chịu để thư giãn sau giờ làm? Bếp xông thảo mộc là giải pháp đơn giản mà hiệu quả. Không cần điện, không hóa chất - chỉ cần một bếp xông thảo mộc đất nung, vài loại thảo mộc tự nhiên và một cây nến tealight nhỏ là đủ để cả không gian lan tỏa hương thơm trong lành.',
    sections: [
      { type: 'h2', text: '1. Tại sao nên dùng bếp xông thảo mộc thay vì các thiết bị khác?' },
      { type: 'p', text: 'Trên thị trường hiện nay có nhiều lựa chọn để làm thơm phòng: máy khuếch tán tinh dầu, bình xịt phòng, sáp thơm hoặc đèn xông điện. Tuy nhiên, bếp xông thảo mộc vẫn có ưu điểm riêng vì dùng nhiệt tự nhiên từ nến tealight để làm nóng nguyên liệu, giúp hương thơm lan chậm, dịu và gần gũi hơn.' },
      { type: 'p', text: 'Thứ nhất, bếp hoạt động hoàn toàn bằng nhiệt từ nến - không cần điện, không phụ thuộc ổ cắm và dễ đặt ở phòng ngủ, phòng khách, góc làm việc hoặc khu vực thiền. Thứ hai, bạn chủ động chọn nguyên liệu tự nhiên như vỏ bưởi, sả, gừng, quế, bồ kết hoặc thảo mộc khô, nhờ vậy mùi hương không bị gắt như nhiều sản phẩm tạo mùi công nghiệp.' },
      { type: 'p', text: 'Nhiều khách hàng của Nến Phương Lâm dùng bếp xông để khử mùi nấm mốc sau mùa mưa, giảm mùi thức ăn trong căn hộ, làm dịu cảm giác căng thẳng buổi tối hoặc tạo không khí ấm cúng khi tiếp khách. Khi dùng đúng cách, bếp xông thảo mộc vừa là vật dụng chăm sóc không gian sống, vừa là món decor mộc mạc rất hợp với nhà Việt.' },
      { type: 'image', src: '/anh-bai-viet/bep-xong-thao-moc-san-pham-chinh.png', alt: 'Hình ảnh bếp xông thảo mộc chính hãng Nến Phương Lâm', caption: 'Bếp xông thảo mộc kết hợp vỏ bưởi, sả và quế cho hương thơm ấm dịu.' },
      { type: 'h2', text: '2. Cách kết hợp bếp xông thảo mộc với nến tealight và nguyên liệu tự nhiên' },
      { type: 'h3', text: '2.1. Chọn nến phù hợp để đốt bếp xông' },
      { type: 'p', text: 'Đây là bước quan trọng nhất vì nến quyết định độ ổn định của nhiệt. Với bếp xông thảo mộc đất nung, nên ưu tiên nến tealight không khói, không mùi để hương thảo mộc là mùi chính trong không gian.' },
      { type: 'list', items: [
        'Nến tealight 4h: lý tưởng cho một buổi xông thảo mộc tiêu chuẩn 30-60 phút, nhiệt ổn định và dễ kiểm soát.',
        'Nến tealight 2h: phù hợp khi bạn chỉ muốn xông nhẹ, khử mùi nhanh hoặc dùng trong phòng nhỏ.',
        'Tránh dùng nến to hoặc nến cây: ngọn lửa quá lớn làm bếp đất nung nóng đột ngột, dễ giảm độ bền của bếp.'
      ] },
      { type: 'p', text: 'Thay vì dùng bật lửa thông thường, bạn có thể dùng diêm dài hoặc que mồi nến để thao tác an toàn hơn, đặc biệt khi đặt nến sâu bên trong thân bếp.' },
      { type: 'image', src: '/anh-bai-viet/cach-chon-nen-tealight-cho-bep-xong.png', alt: 'Cách chọn nến tealight phù hợp cho bếp xông thảo mộc', caption: 'Nến tealight phù hợp giúp bếp xông tỏa nhiệt ổn định và an toàn hơn.' },
      { type: 'h3', text: '2.2. Các loại thảo mộc tự nhiên phù hợp và cách dùng từng bước' },
      { type: 'p', text: 'Gần như mọi thứ trong bếp nhà bạn đều có thể dùng để xông thảo mộc nếu sạch, khô ráo và có mùi hương dễ chịu. Điều quan trọng là dùng lượng vừa phải để hương lan nhẹ, không bị nồng.' },
      { type: 'list', items: [
        'Vỏ bưởi, vỏ cam: hương thơm tươi mát, hợp khử mùi phòng khách hoặc phòng ngủ.',
        'Sả, gừng: hương ấm, có tính kháng khuẩn nhẹ, hợp khi trời mưa hoặc không gian ẩm.',
        'Bồ kết: khử mùi mạnh, tạo cảm giác sạch và truyền thống.',
        'Quế, đinh hương, hoa hồi: hương nồng ấm, hợp buổi tối hoặc mùa lạnh.'
      ] },
      { type: 'p', text: 'Các bước sử dụng bếp xông thảo mộc đúng cách: đặt bếp trên mặt phẳng chịu nhiệt, cho lượng thảo mộc vừa phải, đốt nến tealight, chờ khoảng 5 phút để bếp nóng dần và thổi tắt nến sau 30-60 phút hoặc khi rời khỏi phòng.' },
      { type: 'p', text: 'Mẹo nhỏ: kết hợp 2-3 loại thảo mộc cùng lúc để tạo hương thơm riêng. Ví dụ vỏ bưởi + sả cho cảm giác sạch mát, quế + vỏ cam cho cảm giác ấm áp, bồ kết + sả phù hợp khi cần khử mùi mạnh hơn.' },
      { type: 'image', src: '/anh-bai-viet/cach-dung-bep-xong-thao-moc-an-toan.png', alt: 'Cách dùng bếp xông thảo mộc đúng cách và an toàn tại nhà', caption: 'Đặt bếp xông trên bề mặt chịu nhiệt, xa vật dễ cháy và luôn quan sát khi nến đang cháy.' },
      { type: 'h2', text: '3. Lưu ý quan trọng khi sử dụng bếp xông thảo mộc' },
      { type: 'p', text: 'Bếp xông thảo mộc bằng đất nung an toàn khi dùng đúng cách, nhưng vẫn có nhiệt và lửa nên cần giữ vài nguyên tắc cơ bản.' },
      { type: 'list', items: [
        'Chỉ dùng nến, không dùng than củi hoặc nguồn nhiệt quá mạnh.',
        'Xông 30-60 phút mỗi lần, không để cháy qua đêm.',
        'Không để bếp tiếp xúc nước khi đang nóng để tránh sốc nhiệt.',
        'Không để trẻ nhỏ hoặc thú cưng tiếp xúc trực tiếp với bếp đang hoạt động.',
        'Không rời khỏi nhà khi nến vẫn đang cháy.'
      ] },
      { type: 'p', text: 'Điều làm cho bếp xông thảo mộc đặc biệt bền bỉ là chất liệu đất nung không tráng men, giữ nhiệt tốt và hợp với các nguyên liệu tự nhiên. Sau khi dùng, bạn chỉ cần để bếp nguội, lau nhẹ bằng khăn khô và bảo quản nơi thoáng.' },
      { type: 'image', src: '/anh-bai-viet/luu-y-an-toan-bep-xong-thao-moc.png', alt: 'Lưu ý an toàn khi sử dụng bếp xông thảo mộc đất nung', caption: 'Bảo quản bếp đất nung nơi khô ráo và vệ sinh nhẹ bằng khăn khô sau khi dùng.' },
      { type: 'h2', text: '4. Mua bếp xông thảo mộc và nến tealight uy tín ở đâu?' },
      { type: 'p', text: 'Để trải nghiệm xông thảo mộc thực sự hiệu quả, bạn nên chọn bếp đất nung chắc tay, nến tealight cháy ổn định và nguyên liệu sạch. Một bộ sản phẩm tốt giúp hương thơm lên đều, hạn chế khói và an toàn hơn khi dùng trong nhà.' },
      { type: 'p', text: 'Tại Nến Phương Lâm, bộ combo bếp xông thảo mộc được phối cùng nến tealight không khói, phù hợp cho phòng ngủ, phòng khách, spa mini tại nhà hoặc làm quà tặng chăm sóc sức khỏe.' },
      { type: 'p', text: 'Bạn cũng có thể tham khảo thêm nến tealight các loại và phụ kiện thắp nến để hoàn thiện góc xông thơm riêng cho gia đình.' },
    ],
  },
  'phan-biet-nen-tealight-nen-2h-4h-8h': {
    intro: 'Khi mua nến tealight, bạn sẽ thấy có các loại cháy 2h, 4h hoặc 8h. Nhưng chúng khác nhau ở đâu? Làm sao để chọn nến phù hợp cho bàn thờ, xông tinh dầu hay trang trí phòng? Bài viết này giúp bạn hiểu rõ từng loại nến, từ đó chọn đúng sản phẩm không khói, không mùi, chất lượng cao.',
    paragraphs: [
      '1. Tại sao cần phân biệt nến 2h, nến 4h, nến 8h? Mỗi loại nến tealight có thời gian cháy khác nhau không phải vô lý. Sự chênh lệch này đến từ khối lượng sáp, độ dày viên nến và kích thước tim nến.',
      'Hiểu đúng sự khác biệt giúp bạn tiết kiệm chi phí vì không mua loại quá lâu hoặc quá nhanh hết. Nó cũng giúp an toàn hơn, tránh để nến cháy quá lâu trong không gian kín hoặc khi vắng nhà.',
      'Ngoài ra, chọn đúng nến còn giúp hiệu quả xông tinh dầu, thơm phòng hoặc thờ cúng tốt hơn. Hương thơm tỏa vừa đủ, không quá nồng, không bị mùi nến lấn át mùi tinh dầu.',
      '2. Nến 2 giờ - sử dụng ngắn hạn, nhanh gọn. Nến 2h phù hợp cho các buổi tiệc ngắn, họp mặt trong thời gian ngắn hoặc khi bạn chỉ cần tạo ánh sáng nhẹ và mùi hương trong khoảng thời gian giới hạn.',
      'Ưu điểm của nến 2h là giá thường rẻ hơn, tiết kiệm và an toàn vì cháy nhanh hết. Loại này nhỏ gọn, dễ xếp số lượng lớn để trang trí bàn tiệc, góc phòng hoặc không gian sự kiện.',
      'Nhược điểm là thời gian cháy ngắn, không đủ cho những buổi thư giãn dài. Nếu dùng để xông tinh dầu, mùi hương sẽ nhanh kết thúc và bạn có thể phải thay nến giữa chừng.',
      '3. Nến 4 giờ - lựa chọn cân bằng, phổ biến nhất. Đây là loại nến tealight được dùng nhiều nhất vì thời gian cháy vừa đủ cho một buổi tối thư giãn, xông tinh dầu, xông thảo mộc hoặc cúng lễ tại gia đình.',
      'Nến 4h phù hợp với đèn xông tinh dầu vì tạo nhiệt ổn định, giúp tinh dầu bay hơi đều mà không quá nóng. Nếu bạn chưa biết chọn loại nào, nến 4h là lựa chọn dễ dùng và an toàn nhất.',
      'Ưu điểm của nến 4h là thời gian vừa phải, giá hợp lý, dùng được cho nhiều mục đích khác nhau. Nhược điểm là nếu cần đốt xuyên suốt một buổi tiệc dài hoặc không gian thiền nhiều giờ, 4h có thể chưa đủ.',
      '4. Nến 8 giờ - cháy lâu, dành cho nhu cầu dài. Nến 8h phù hợp khi bạn cần thời gian cháy dài hơn, ví dụ trong studio yoga, không gian thiền định, buổi trang trí kéo dài hoặc một số khu vực cần ánh sáng liên tục.',
      'Ưu điểm là cháy lâu, ít phải thay nến và tiết kiệm công thay thế nếu dùng trong thời gian dài. Tuy nhiên, nến 8h thường có kích thước lớn hơn và lượng sáp nhiều hơn.',
      'Khi dùng nến 8h, không nên để nến cháy liên tục quá lâu trong phòng kín. Luôn tắt nến trước khi ngủ hoặc rời khỏi phòng để đảm bảo an toàn.',
      '5. Nến xông tinh dầu và nến thờ cúng có khác nhau không? Thực ra nến tealight không khói, không mùi có thể dùng cho cả hai mục đích. Điểm quan trọng là chất lượng sáp và độ ổn định của tim nến.',
      'Khi dùng cho xông tinh dầu, nên ưu tiên nến không khói, không mùi để tinh dầu là mùi hương chính. Tim nến nên ổn định để nhiệt tỏa đều, giúp tinh dầu lan hương nhẹ nhàng và không bị cháy khét.',
      'Khi dùng cho bàn thờ gia đình, nến sạch giúp không gian thanh tịnh hơn, hạn chế khói đen bám trần, bám tường và dễ vệ sinh sau khi sử dụng.',
      '6. Lưu ý an toàn khi sử dụng nến tealight. Trước khi thắp, nên kiểm tra tim nến và cắt ngắn nếu tim quá dài để tránh ngọn lửa bập bùng hoặc tạo khói.',
      'Luôn đặt nến trên bề mặt phẳng, chắc chắn, xa rèm, giấy, gỗ mỏng hoặc vật dễ cháy. Khi dùng với đèn xông tinh dầu, cần giữ khoảng cách hợp lý để nhiệt không quá cao.',
      'Không để nến cháy khi không có người quan sát. Dù là nến 2h, 4h hay 8h, nguyên tắc quan trọng nhất vẫn là tắt nến trước khi ngủ hoặc rời khỏi phòng.',
      '7. Nên mua nến tealight ở đâu? Để đảm bảo chất lượng và an toàn, bạn nên chọn nến tealight không khói, không mùi từ nơi uy tín. Nến Phương Lâm cung cấp các dòng nến tealight phù hợp cho xông tinh dầu, thờ cúng, trang trí và chăm sóc không gian sống.',
      'Lựa chọn đúng loại nến không chỉ giúp tiết kiệm chi phí mà còn giúp không gian sống thơm sạch, yên bình và an toàn hơn mỗi ngày.',
    ],
  },
  'cach-xong-thao-moc-dung-cach': {
    intro: 'Xông thảo mộc đúng cách không chỉ giúp thư giãn mà còn hỗ trợ làm sạch không gian, giảm cảm giác mệt mỏi và tạo nhịp sinh hoạt nhẹ nhàng hơn mỗi ngày.',
    paragraphs: [
      'Trước khi xông, bạn nên chọn không gian thoáng vừa phải, đóng bớt cửa để hương không bay đi quá nhanh nhưng vẫn đảm bảo đủ không khí. Chuẩn bị nồi nước nóng hoặc bếp xông phù hợp với từng loại thảo mộc.',
      'Nếu dùng thảo mộc khô, hãy cho lượng vừa đủ để mùi hương lên dịu và đều. Không nên cho quá nhiều ngay từ đầu vì hương quá đậm có thể gây khó chịu, nhất là với người mới bắt đầu.',
      'Thời gian xông lý tưởng thường từ 15 đến 20 phút. Sau khi xông xong, nghỉ ngơi vài phút, uống nước ấm và tránh ra gió lạnh ngay để cơ thể thích nghi tốt hơn.',
    ],
  },
  'nen-tealight-xong-nha-cach-dung': {
    intro: 'Nến tealight tuy nhỏ nhưng rất tiện cho việc xông nhà, đốt tinh dầu hoặc tạo không khí ấm cúng nếu dùng đúng cách.',
    paragraphs: [
      'Hãy đặt nến trên bề mặt phẳng, chắc chắn và cách xa rèm, giấy hoặc vật dễ cháy. Nếu dùng cùng đèn xông, hãy đảm bảo phần đế đủ thoáng để nhiệt tỏa đều.',
      'Mỗi lần chỉ nên đốt trong khoảng thời gian vừa phải. Khi nến gần tàn, không nên cố đốt tiếp trong cốc quá mỏng vì nhiệt có thể tăng cao hơn bình thường.',
      'Sau khi dùng xong, chờ nến nguội hẳn rồi mới di chuyển hoặc thay nến mới. Điều này giúp an toàn hơn và giữ cho khu vực xông luôn sạch sẽ.',
    ],
  },
  'top-5-thao-moc-xong-mua-dong': {
    intro: 'Mùa đông là thời điểm nhiều người tìm đến thảo mộc để giữ không gian ấm áp và dễ chịu hơn.',
    paragraphs: [
      'Ngải cứu là lựa chọn quen thuộc nhờ mùi thơm ấm và cảm giác thư giãn rõ rệt. Sả gừng lại phù hợp khi bạn muốn căn phòng có cảm giác sạch và tươi hơn.',
      'Bạc hà, quế và vỏ cam khô cũng là những nguyên liệu được nhiều người yêu thích vì tạo mùi hương rõ nét, dễ phối hợp và thích hợp cho không gian sống nhỏ.',
      'Khi chọn thảo mộc mùa đông, nên ưu tiên mùi hương ấm, dễ chịu và không quá gắt. Hãy thử từng loại với lượng nhỏ trước khi phối thành combo riêng cho gia đình.',
    ],
  },
  'xong-nha-thao-moc-co-diet-khuan-khong': {
    intro: 'Xông nhà bằng thảo mộc có thể giúp không gian dễ chịu và giảm mùi ẩm bí, nhưng cần hiểu đúng vai trò của nó.',
    paragraphs: [
      'Một số loại thảo mộc có tinh dầu tự nhiên tạo cảm giác sạch và thoáng, tuy nhiên không nên xem đây là phương pháp thay thế hoàn toàn cho vệ sinh nhà cửa thông thường.',
      'Hiệu quả thực tế phụ thuộc vào loại nguyên liệu, cách dùng, độ thông thoáng của căn phòng và tần suất vệ sinh bề mặt trong nhà.',
      'Cách dùng hợp lý nhất là kết hợp xông thảo mộc với việc lau dọn định kỳ, giữ không gian khô ráo và mở cửa cho lưu thông không khí.',
    ],
  },
  'combo-xong-nha-cho-nguoi-moi': {
    intro: 'Nếu mới bắt đầu, bạn không cần chuẩn bị quá nhiều. Một bộ xông cơ bản nhưng đúng nhu cầu sẽ dễ dùng và tiết kiệm hơn.',
    paragraphs: [
      'Một combo cơ bản thường gồm thảo mộc hoặc nến xông, dụng cụ đốt hoặc bếp xông, cùng phụ kiện nhỏ như đĩa lót hoặc nến tealight.',
      'Người mới nên ưu tiên những mùi hương nhẹ, dễ quen như sả gừng, lavender hoặc các combo có sẵn hướng dẫn sử dụng rõ ràng.',
      'Điều quan trọng nhất là bắt đầu từ nhu cầu thật của bạn: thư giãn, khử mùi phòng, hay tạo không khí cho buổi tối. Từ đó việc chọn combo sẽ dễ hơn nhiều.',
    ],
  },
  'ngai-cuu-xong-hoi-tac-dung-cach-dung': {
    intro: 'Ngải cứu là một trong những loại thảo mộc phổ biến nhất khi xông hơi nhờ mùi thơm ấm và cảm giác dễ chịu sau khi dùng.',
    paragraphs: [
      'Ngải cứu thường được dùng khi muốn thư giãn cơ thể, tạo cảm giác ấm và giảm bớt sự nặng nề sau một ngày dài vận động hoặc làm việc.',
      'Khi xông, nên dùng lượng vừa đủ, tránh để nước quá sôi mạnh trong không gian kín hoàn toàn vì hơi nóng đậm đặc có thể gây khó chịu.',
      'Nếu cơ thể đang mệt, hãy xông thời gian ngắn trước để theo dõi phản ứng. Sau đó điều chỉnh dần cho phù hợp với thể trạng của mình.',
    ],
  },
  'sa-gung-xong-nha-duoi-muoi': {
    intro: 'Sả gừng là bộ đôi quen thuộc với nhiều gia đình vì mùi thơm dễ chịu, sạch và tạo cảm giác căn phòng sáng hơn.',
    paragraphs: [
      'Sả mang đến hương tươi, trong khi gừng tạo cảm giác ấm. Khi kết hợp, hai nguyên liệu này cho ra mùi hương rõ nhưng vẫn dễ chịu với đa số người dùng.',
      'Bạn có thể dùng sả gừng để xông phòng khách, phòng ngủ hoặc khu vực sinh hoạt chung vào cuối ngày để không gian bớt bí và có cảm giác thư giãn hơn.',
      'Để hiệu quả ổn định, nên xông với tần suất vừa phải và giữ căn phòng sạch, khô thoáng thay vì chỉ phụ thuộc hoàn toàn vào mùi hương.',
    ],
  },
  'bep-xong-tinh-dau-gom-loai-nao-tot': {
    intro: 'Bếp xông gốm được ưa chuộng vì vẻ đẹp thủ công, dễ phối với nhiều không gian và cách dùng khá đơn giản.',
    paragraphs: [
      'Khi chọn bếp xông gốm, bạn nên chú ý độ dày thành gốm, độ ổn định của chân đế và khoảng cách giữa nến và khay tinh dầu phía trên.',
      'Loại bếp tốt là loại giữ nhiệt vừa phải, tỏa mùi đều và không quá nóng ở phần thân ngoài. Điều này vừa an toàn vừa giúp dùng bền hơn.',
      'Nếu mới dùng, hãy chọn thiết kế đơn giản, dễ vệ sinh và màu trung tính để phù hợp với nhiều góc nhà.',
    ],
  },
  'xong-thao-moc-sau-sinh-loi-ich': {
    intro: 'Xông thảo mộc sau sinh là một thói quen quen thuộc trong nhiều gia đình, nhưng cần sử dụng theo hướng thận trọng và phù hợp.',
    paragraphs: [
      'Điều quan trọng là ưu tiên sự thoải mái và an toàn của mẹ sau sinh. Không nên xông quá nóng hoặc quá lâu ngay trong những lần đầu tiên.',
      'Nên chọn nguyên liệu nhẹ mùi, dễ chịu và đảm bảo rõ nguồn gốc. Nếu cơ thể còn yếu, việc tham khảo thêm ý kiến chuyên môn luôn là lựa chọn tốt.',
      'Xông sau sinh nên được xem là một hình thức hỗ trợ thư giãn, kết hợp với nghỉ ngơi, ăn uống và chăm sóc cơ thể khoa học.',
    ],
  },
};

const SAMPLE_ORDERS = [
  { id: '#DH001', customer: 'Nguyễn Thị Mai', phone: '0901234567', address: '123 Lê Lợi, Q.1, TP.HCM', items: [{ name: 'Nến thơm hoa hồng lavender', qty: 2, price: 125000 }, { name: 'Bếp xông gốm thủ công', qty: 1, price: 185000 }], total: 435000, status: 'New', date: '20/04/2025' },
  { id: '#DH002', customer: 'Trần Văn Bình', phone: '0912345678', address: '456 Nguyễn Huệ, Q.1, TP.HCM', items: [{ name: 'Combo thư giãn cuối tuần', qty: 1, price: 265000 }], total: 265000, status: 'Processing', date: '19/04/2025' },
  { id: '#DH003', customer: 'Lê Thị Hoa', phone: '0923456789', address: '789 Hai Bà Trưng, Q.3, TP.HCM', items: [{ name: 'Thảo mộc xông ngải cứu', qty: 3, price: 65000 }, { name: 'Đĩa lót nến gốm trắng', qty: 2, price: 35000 }], total: 265000, status: 'Completed', date: '18/04/2025' },
  { id: '#DH004', customer: 'Phạm Minh Khoa', phone: '0934567890', address: '12 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM', items: [{ name: 'Nến thơm gỗ đàn hương', qty: 1, price: 145000 }, { name: 'Que cắt tim nến inox', qty: 1, price: 45000 }], total: 190000, status: 'New', date: '20/04/2025' },
  { id: '#DH005', customer: 'Hoàng Thị Lan', phone: '0945678901', address: '34 Võ Văn Tần, Q.3, TP.HCM', items: [{ name: 'Thảo mộc xông sả gừng', qty: 2, price: 55000 }, { name: 'Combo thư giãn cuối tuần', qty: 1, price: 265000 }], total: 375000, status: 'Processing', date: '19/04/2025' },
];

Object.assign(window, { CATEGORIES, PRODUCTS, BLOG_POSTS, SAMPLE_ORDERS });
