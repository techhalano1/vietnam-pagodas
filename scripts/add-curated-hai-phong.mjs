// Adds curated Hải Phòng pagodas (no Vietnamese Wikipedia article) to
// src/data/pagodas.json and src/data/details.json.
// Content researched from government/heritage and press sources listed in
// each entry's references. Coordinates verified against OpenStreetMap;
// entries without a verifiable coordinate keep lat/lng null.
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname);
const pagodasPath = path.join(dir, "../src/data/pagodas.json");
const detailsPath = path.join(dir, "../src/data/details.json");

const CURATED = [
  {
    pagoda: {
      id: 90000001,
      slug: "chua-cao-linh",
      name: "Chùa Cao Linh",
      province: "Hải Phòng",
      lat: null,
      lng: null,
      description:
        "Chùa Cao Linh tọa lạc tại thôn Bắc Hà, xã Bắc Sơn, huyện An Dương, cửa ngõ phía Tây thành phố Hải Phòng, cách trung tâm thành phố khoảng 12 km. Với lịch sử hơn 300 năm và khuôn viên rộng khoảng 49.000 m², đây là một trong những ngôi chùa lớn nhất Hải Phòng, nổi bật với kiến trúc pha trộn giữa nét cổ kính phương Đông và phong cách hiện đại.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Cao Linh Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Cao Linh tọa lạc tại thôn Bắc Hà, xã Bắc Sơn, huyện An Dương, cửa ngõ phía Tây thành phố Hải Phòng, cách trung tâm thành phố khoảng 12 km. Chùa có diện tích khoảng 49.000 m², trước mặt là dãy núi Thiên Văn thuộc Kiến An, phía sau là sông Hà Liên.",
        },
        {
          heading: "Lịch sử",
          text: "Theo ghi chép, chùa có thể do dòng họ Lê Văn trong làng Hà Liên xây dựng; bia đá trong chùa ghi lại lần trùng tu cuối vào đời Hậu Lê, cách đây hơn 300 năm. Thuở ban đầu chùa chỉ gồm ba gian tiền đường, hai gian hậu cung, năm gian nhà tổ và ba gian nhà bếp mái thấp.\nTrong kháng chiến chống Pháp, chùa là nơi che giấu và nuôi dưỡng cán bộ cách mạng, vì vậy bị thực dân Pháp đốt mất 20 gian. Năm 2001, chùa được giao cho Thượng tọa Thích Thanh Giác, trụ trì chùa Phổ Chiếu, kiêm nhiệm trụ trì; từ đó chùa được trùng tu, xây dựng quy mô lớn để có diện mạo như ngày nay.",
        },
        {
          heading: "Kiến trúc",
          text: "Chùa Cao Linh sở hữu kiến trúc nguy nga, pha trộn giữa nét cổ kính phương Đông và phong cách hiện đại phương Tây. Cổng Ngũ Quan nổi bật với hoa văn rồng phượng và tượng Quan Thế Âm Bồ Tát, tượng trưng cho năm đức tính căn bản trong Phật giáo. Tòa chính điện Đại Hùng Bảo Điện được thiết kế theo hình chữ Đinh truyền thống, gồm ba gian tiền đường và một gian hậu cung, thờ Phật Thích Ca Mâu Ni. Khuôn viên chùa còn có vườn tháp, tượng Phật và nhiều công trình phụ trợ phục vụ sinh hoạt Phật giáo của đông đảo Phật tử.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Cao Linh Pagoda is located in Bac Ha hamlet, Bac Son commune, An Duong district, at the western gateway of Hai Phong, about 12 km from the city center. Covering roughly 49,000 m², it is one of the largest pagodas in Hai Phong, facing the Thien Van mountain range with the Ha Lien river behind.",
        },
        {
          heading: "History",
          text: "According to local records, the pagoda was likely built by the Le Van family of Ha Lien village; a stone stele records its last restoration in the Later Le dynasty, over 300 years ago. Originally it was a modest complex of a three-bay front hall, two-bay sanctuary and five-bay patriarch house.\nDuring the resistance war against the French, the pagoda sheltered revolutionary cadres and 20 of its bays were burned down by French forces. In 2001 it was entrusted to Venerable Thich Thanh Giac, abbot of Pho Chieu Pagoda, and a large-scale restoration gave the pagoda its present appearance.",
        },
        {
          heading: "Architecture",
          text: "The pagoda blends classical East Asian temple forms with modern Western elements. Its Five-Gate entrance (Ngu Quan) is decorated with dragon and phoenix motifs and a statue of Avalokitesvara Bodhisattva, symbolizing five fundamental Buddhist virtues. The main hall, Dai Hung Bao Dien, follows the traditional Dinh-shaped plan with a three-bay front hall and a rear sanctuary enshrining Shakyamuni Buddha. The grounds include a stupa garden, Buddha statues and facilities serving the city's large Buddhist community.",
        },
      ],
      references: [
        "https://chonthieng.com/dia-diem/chua-cao-linh-an-duong-hai-phong/",
        "https://quangthangcatba.com/chua-cao-linh-hai-phong",
      ],
    },
  },
  {
    pagoda: {
      id: 90000002,
      slug: "thap-tuong-long",
      name: "Tháp Tường Long (Chùa Tháp)",
      province: "Hải Phòng",
      lat: 20.7142698,
      lng: 106.7703957,
      description:
        "Tháp Tường Long, còn gọi là chùa Tháp hay tháp Đồ Sơn, tọa lạc trên đỉnh núi Long Sơn cao 95,2 m thuộc phường Vạn Hương, quận Đồ Sơn, Hải Phòng. Tháp được xây dựng năm 1058 dưới thời vua Lý Thánh Tông và được phỏng dựng lại từ năm 2007 với 9 tầng, cao 37,14 m — công trình kỷ niệm một nghìn năm Thăng Long – Hà Nội.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Tuong Long Tower (Thap Pagoda)",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Tháp Tường Long, còn gọi là chùa Tháp hay tháp Đồ Sơn, tọa lạc trên đỉnh núi Long Sơn cao 95,2 m so với mặt nước biển — ngọn núi đầu tiên trong chín ngọn chạy dọc bán đảo Đồ Sơn, thuộc phường Vạn Hương, quận Đồ Sơn, Hải Phòng.",
        },
        {
          heading: "Lịch sử",
          text: "Theo sách Đại Việt sử lược, năm Mậu Tuất 1058, vua Lý Thánh Tông sau khi ngự giá qua biển Ba Lộ đã dừng chân tại đây và cho xây tháp. Sau đó nhà vua nằm mộng thấy rồng vàng, bèn ban cho ngọn tháp tên Tường Long — nghĩa là \"thấy rồng vàng hiện lên\" — để ghi nhớ điềm lành. Theo Đại Nam nhất thống chí, Tường Long là ngọn tháp cao nhất so với các công trình kiến trúc đương thời; ngoài chức năng tôn giáo, tháp còn là đài quan sát bảo vệ bờ cõi phía Đông Bắc và là hành cung của vua chúa trong những chuyến tuần du.\nDi tích được khai quật khảo cổ lần đầu năm 1978, phát hiện nền móng tháp hình vuông giật ba cấp (cạnh lớn nhất 7,96 m) cùng nhiều di vật như gạch xây tháp, bệ tượng A Di Đà bằng đá xanh, chân tảng hoa sen và các con giống đất nung hình rồng, phượng, chim thần Kinnara. Cuộc khai quật lần hai năm 1998 phát hiện thêm nền móng thứ hai, đưa đến nhận định đây có thể là một quần thể tháp.",
        },
        {
          heading: "Công trình phỏng dựng",
          text: "Tháp Tường Long ngày nay được phỏng dựng trên nền móng tháp cổ thế kỷ XI, khởi công năm 2007 và hoàn thiện sau 10 năm, là công trình kỷ niệm một nghìn năm Thăng Long – Hà Nội. Tháp gồm 9 tầng, cao 37,14 m, chân tháp hình vuông với bốn lối lên xuống; bên trong đặt pho tượng A Di Đà ngồi trên tòa sen bằng đá. Quần thể còn có chuông chùa và nhà che hố khảo cổ phục vụ tham quan.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Tuong Long Tower, also known as Thap Pagoda or Do Son Tower, stands on the 95.2 m summit of Long Son — the first of nine hills running along the Do Son peninsula — in Van Huong ward, Do Son district, Hai Phong.",
        },
        {
          heading: "History",
          text: "According to the chronicle Dai Viet su luoc, in 1058 King Ly Thanh Tong stopped here after sailing past the Ba Lo estuary and ordered a tower built. He later dreamed of a golden dragon and named the tower Tuong Long — \"appearance of the golden dragon\" — to commemorate the auspicious omen. The geography Dai Nam nhat thong chi describes it as the tallest structure of its era; beyond its religious role it served as a watchtower guarding the northeastern coast and as a royal resting palace during inspection tours.\nArchaeological excavations in 1978 uncovered a square, three-stepped foundation (largest side 7.96 m) together with tower bricks, a blue-stone Amitabha statue pedestal, lotus column bases and terracotta sacred animals — dragons, phoenixes and Kinnara birds. A second excavation in 1998 revealed another foundation, suggesting the site was once a complex of towers rather than a single one.",
        },
        {
          heading: "Reconstruction",
          text: "The present tower is a reconstruction on the 11th-century foundations, begun in 2007 and completed after ten years as a project marking the millennium of Thang Long–Hanoi. It has nine storeys and rises 37.14 m; the square base has four entrances and houses a stone statue of Amitabha Buddha seated on a lotus throne. The complex also preserves the excavated foundations under a protective shelter for visitors.",
        },
      ],
      references: [
        "https://dsvh.gov.vn/thap-tuong-long-thanh-pho-hai-phong-3362",
        "https://dantri.com.vn/du-lich/danh-lam-de-nhat-thap-cao-sung-sung-9-tang-tai-hai-phong-20240115100321892.htm",
      ],
    },
  },
  {
    pagoda: {
      id: 90000003,
      slug: "chua-do-hai-phong",
      name: "Chùa Đỏ (Linh Độ tự)",
      province: "Hải Phòng",
      lat: 20.8710055,
      lng: 106.7026447,
      description:
        "Chùa Đỏ, tên chữ Linh Độ tự, nằm trên phố Lê Lai, quận Ngô Quyền, Hải Phòng. Chùa gắn với sự kiện Hưng Đạo Vương Trần Quốc Tuấn trú quân năm 1288 trước trận Bạch Đằng; kiến trúc hiện nay cao 26 m theo kiểu cổ diêm chồng đấu ba tầng 20 mái độc đáo, được xếp hạng Di tích cấp quốc gia.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Do Pagoda (Linh Do Temple)",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Đỏ, tên chữ Linh Độ tự, nằm trong ngõ nhỏ trên phố Lê Lai, quận Ngô Quyền, thành phố Hải Phòng. Đây được xem là một trong những ngôi chùa linh thiêng nhất của thành phố Cảng và là Di tích cấp quốc gia.",
        },
        {
          heading: "Lịch sử",
          text: "Tương truyền, xưa kia nơi đây là bãi bồi ven sông có nhiều người chết trôi dạt vào, nên dân làng dựng một ngôi chùa nhỏ thờ Phật, cầu Như Lai siêu độ cho các vong linh xấu số — vì vậy chùa có tên chữ Linh Độ. Năm 1288, khi Hưng Đạo Vương Trần Quốc Tuấn đến vùng An Dương nghiên cứu địa hình chuẩn bị tiêu diệt đoàn thuyền Ô Mã Nhi rút chạy qua cửa Bạch Đằng, ông cho lo việc hậu cần trong chùa, bếp luôn đỏ lửa. Từ đó người dân gọi là chùa Đỏ để ghi nhớ ngày Đức Thánh Trần trú quân. Sau khi Trần Hưng Đạo qua đời, dân địa phương xây thêm hai ngôi miếu hai bên chùa thờ ngài và các bộ tướng thân tín, tiêu biểu như danh tướng Phạm Ngũ Lão.",
        },
        {
          heading: "Kiến trúc",
          text: "Chùa Đỏ ngày nay cao 26 m với kiến trúc cổ diêm chồng đấu ba tầng 20 mái — lối kiến trúc độc đáo hiếm có trong lịch sử chùa chiền Việt Nam. Chùa chia làm ba cung chính: tiền đường, trung đường và hậu cung; trong chùa đặt pho tượng Phật bằng gỗ thuộc loại lớn bậc nhất Việt Nam. Các ngày lễ lớn như Vu Lan, Phật Đản thu hút đông đảo Phật tử và du khách cả nước.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Do Pagoda (Red Pagoda), formally Linh Do Tu, lies in a small lane off Le Lai street in Ngo Quyen district, Hai Phong. It is considered one of the most sacred pagodas of the port city and is ranked a national relic.",
        },
        {
          heading: "History",
          text: "Legend holds that the site was once a riverside sandbank where bodies of the drowned washed ashore, so villagers built a small pagoda to pray for the salvation of those unfortunate souls — hence the formal name Linh Do (\"spiritual deliverance\"). In 1288, when Grand Prince Tran Hung Dao surveyed the An Duong area preparing to destroy O Ma Nhi's fleet retreating through the Bach Dang estuary, he had his army's kitchens set up at the pagoda, keeping its fires constantly red — giving the pagoda its popular name, the Red Pagoda. After Tran Hung Dao's death, villagers built two shrines beside the pagoda honoring him and his trusted generals, notably Pham Ngu Lao.",
        },
        {
          heading: "Architecture",
          text: "The present pagoda rises 26 m in a rare co diem chong dau style with three tiers and twenty roofs — an architectural form considered unique among Vietnamese pagodas. It comprises three main halls (front, middle and rear sanctuary) and houses one of the largest wooden Buddha statues in Vietnam. Major festivals such as Vu Lan and Buddha's Birthday draw large crowds of pilgrims.",
        },
      ],
      references: [
        "https://dantri.com.vn/du-lich/ngoi-chua-co-3-tang-20-mai-dat-tuong-phat-bang-go-lon-bac-nhat-viet-nam-20240108165307730.htm",
        "https://travelviet.net/vn/relics/hai-phong/khu-di-tich-chua-do",
        "https://cacdonghohaiphong.com/chua-do-linh-do-tu-trong-dong-chay-phat-giao-xu-dong/",
      ],
    },
  },
  {
    pagoda: {
      id: 90000004,
      slug: "chua-ve-hai-phong",
      name: "Chùa Vẽ (Hoa Linh tự)",
      province: "Hải Phòng",
      lat: 20.8617726,
      lng: 106.7205928,
      description:
        "Chùa Vẽ, tên chữ Hoa Linh tự, tọa lạc tại phường Đông Hải, quận Hải An, Hải Phòng, bên dòng sông Bạch Đằng lịch sử. Tương truyền Ngô Quyền từng lập đồn binh tại đây năm 938 và Trần Hưng Đạo lập đài quan sát, vẽ địa đồ chuẩn bị trận Bạch Đằng năm 1288 — nguồn gốc tên gọi chùa Vẽ. Chùa được xếp hạng Di tích kiến trúc – nghệ thuật cấp quốc gia năm 1994.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/f/f7/Ch%C3%B9a_V%E1%BA%BD%2C_H%E1%BA%A3i_Ph%C3%B2ng_-_panoramio_%282%29.jpg",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Ch%C3%B9a_V%E1%BA%BD%2C_H%E1%BA%A3i_Ph%C3%B2ng_-_panoramio_%282%29.jpg/500px-Ch%C3%B9a_V%E1%BA%BD%2C_H%E1%BA%A3i_Ph%C3%B2ng_-_panoramio_%282%29.jpg",
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Ve Pagoda (Hoa Linh Temple)",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Vẽ, tên chữ Hoa Linh tự, cách trung tâm Hải Phòng chừng 5 km về phía Đông Bắc, ẩn mình trong ngõ cuối đường Đà Nẵng, thuộc phường Đông Hải, quận Hải An. Chùa nằm trong quần thể ba di tích gồm chùa Vẽ, phủ Thượng Đoạn và đền Phú Xá, bên dòng sông Bạch Đằng lịch sử. Năm 1994, chùa được xếp hạng Di tích kiến trúc – nghệ thuật cấp quốc gia.",
        },
        {
          heading: "Lịch sử",
          text: "Theo sự tích, năm 938 Ngô Quyền đã chọn chùa làm nơi lập đồn binh chuẩn bị cho thế trận Bạch Đằng đánh đuổi quân Nam Hán. Đến năm 1288, trong cuộc kháng chiến chống quân Nguyên, Trần Hưng Đạo bí mật tới chùa lập đài quan sát, vẽ địa đồ theo kiểu rắc vừng trên bánh đa để xây dựng kế hoạch tác chiến cho trận thắng trên sông Bạch Đằng — từ đó chùa mang tên chùa Vẽ.",
        },
        {
          heading: "Kiến trúc",
          text: "Cổng tam quan chùa đắp nổi hàng chữ \"Hoa Linh bảo tự\" cùng đôi câu đối khuyến thiện. Toàn bộ khuôn viên rộng khoảng 7.000 m² gồm nhà thờ tổ, tòa chính điện, học đường, khánh đường và nhà bia lưu giữ các văn bia \"Trùng tu phật từ bi ký\", \"Hoa Linh từ bi ký\". Chùa có vườn tháp với các tháp Thiệu Long, Vong Nam và hồ thả hoa súng; sân trước là vườn tỳ ni với nhiều cây cảnh và tượng đắp nổi theo phong cách kiến trúc Phật giáo quen thuộc.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Ve Pagoda, formally Hoa Linh Tu, lies about 5 km northeast of central Hai Phong at the end of Da Nang street in Dong Hai ward, Hai An district. It forms a relic cluster with Thuong Doan Palace and Phu Xa Temple beside the historic Bach Dang river, and was ranked a national architecture-and-art relic in 1994.",
        },
        {
          heading: "History",
          text: "According to tradition, in 938 Ngo Quyen chose the pagoda as a garrison site while preparing the Bach Dang battle formation that expelled the Southern Han invaders. In 1288, during the resistance against the Yuan-Mongol invasion, Tran Hung Dao secretly set up an observation post at the pagoda and sketched battle maps — reputedly by scattering sesame seeds on rice crackers — to plan the victorious Bach Dang river battle. The pagoda's popular name, Chua Ve (\"the Drawing Pagoda\"), derives from this episode.",
        },
        {
          heading: "Architecture",
          text: "The three-gate entrance bears the embossed inscription \"Hoa Linh bao tu\" with a pair of moral-teaching parallel sentences. The roughly 7,000 m² grounds include the patriarch house, main sanctuary, study hall, bell hall and a stele house preserving restoration inscriptions. A stupa garden with the Thieu Long and Vong Nam towers and a water-lily pond complete the tranquil compound.",
        },
      ],
      references: [
        "https://thanhphohaiphong.gov.vn/chua-ve-hoa-linh-co-tu.html",
        "http://pagoda.amazingvietnam.vn/2026/06/chua-ve-hoa-linh-tu.html",
      ],
    },
  },
  {
    pagoda: {
      id: 90000005,
      slug: "chua-mo",
      name: "Chùa Mõ",
      province: "Hải Phòng",
      lat: null,
      lng: null,
      description:
        "Chùa Mõ nằm trong cụm di tích đền – chùa Mõ tại xã Ngũ Phúc, huyện Kiến Thụy, Hải Phòng, gắn với công chúa Quỳnh Trân đời Trần — người lập điền trang, dạy dân khai khẩn ruộng nương từ năm 1283 và dùng tiếng mõ làm hiệu lệnh điều hành công việc. Cụm di tích được công nhận Di tích lịch sử văn hóa cấp quốc gia và nổi tiếng với cây gạo hơn 700 năm tuổi.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Mo Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Mõ nằm trong cụm di tích đền – chùa Mõ tại xã Ngũ Phúc, huyện Kiến Thụy, thành phố Hải Phòng. Cụm di tích được công nhận Di tích lịch sử văn hóa cấp quốc gia (đền Mõ năm 1992) và nổi tiếng với cây gạo cổ thụ hơn 700 năm tuổi.",
        },
        {
          heading: "Lịch sử",
          text: "Theo ngọc phả triều Trần, công chúa Quỳnh Trân là con gái vua Trần Thánh Tông. Vốn giàu đức hạnh từ bi, bà xin vua cha cho xuất gia thờ Phật. Năm 1283, khi qua xã Nghi Dương (nay là xã Ngũ Phúc), thấy địa thế như con chim đang bay, phong cảnh thanh tịnh, bà quyết định dừng chân lập am tu hành. Công chúa lập điền trang thái ấp, cấp lương thực tiền bạc, dạy dân khai khẩn ruộng nương, trồng dâu dệt vải.\nĐể điều hành công việc hằng ngày của cộng đồng, bà nghĩ ra cách dùng tiếng mõ làm hiệu lệnh — từ đó có các tên Tổng Mõ, chợ Mõ, đền Mõ và chùa Mõ. Trong kháng chiến chống quân Nguyên Mông, bà chiêu tập binh sĩ, tích trữ lương thảo giúp triều đình đánh giặc. Sau khi công chúa viên tịch, nhân dân lập đền thờ bà ngay cạnh chùa; di tích đã được các triều đại ban 12 đạo sắc phong.",
        },
        {
          heading: "Di tích",
          text: "Cụm đền – chùa Mõ mang kiến trúc nghệ thuật cổ, là nơi thờ Phật và thờ công chúa Quỳnh Trân. Trong khuôn viên có cây gạo được trồng từ thời công chúa về đây tu hành, đến nay hơn 700 năm tuổi, được công nhận là Cây di sản Việt Nam và gắn với nhiều giai thoại linh thiêng của vùng đất Kiến Thụy — miền trầm tích Dương Kinh của vương triều Mạc.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Mo Pagoda belongs to the Mo temple-and-pagoda relic cluster in Ngu Phuc commune, Kien Thuy district, Hai Phong. The cluster is a nationally ranked historical-cultural relic and is famous for a giant silk-cotton tree over 700 years old.",
        },
        {
          heading: "History",
          text: "According to Tran-dynasty royal records, Princess Quynh Tran was a daughter of King Tran Thanh Tong. Devout and compassionate, she asked her father's permission to become a Buddhist nun. In 1283, passing through Nghi Duong (today's Ngu Phuc commune), she found the landscape shaped like a bird in flight and settled there to practice. She established an estate, distributed food and money, and taught local people to reclaim land, farm and weave.\nTo coordinate the community's daily work she used the sound of a wooden fish (mo) as a signal — the origin of the names Tong Mo, Mo market, Mo temple and Mo pagoda. During the Mongol invasions she recruited soldiers and stockpiled provisions for the court's war effort. After her death the people built a temple beside the pagoda to worship her; twelve royal edicts of investiture were conferred on the site over successive dynasties.",
        },
        {
          heading: "The relic site",
          text: "The temple-and-pagoda cluster preserves classical architecture and worships both the Buddha and Princess Quynh Tran. In its grounds stands a silk-cotton tree said to have been planted when the princess settled here — now more than 700 years old and recognized as a Vietnam Heritage Tree — in Kien Thuy, the old Duong Kinh heartland of the Mac dynasty.",
        },
      ],
      references: [
        "https://thanhdoanhaiphong.gov.vn/den-mo-xa-ngu-phuc-huyen-kien-thuy-nd23114.html",
        "https://nhandan.vn/bao-ton-va-lan-toa-gia-tri-di-tich-lich-su-van-hoa-den-mo-post786023.html",
      ],
    },
  },
  {
    pagoda: {
      id: 90000006,
      slug: "chua-pho-chieu",
      name: "Chùa Phổ Chiếu",
      province: "Hải Phòng",
      lat: 20.8424753,
      lng: 106.6773064,
      description:
        "Chùa Phổ Chiếu tọa lạc tại phường Dư Hàng Kênh, quận Lê Chân, Hải Phòng, được dựng năm 1953, ban đầu là Tam Giáo đường thờ cả Phật, Nho, Lão. Chùa là cơ sở cách mạng trong hai cuộc kháng chiến — nơi nuôi giấu chiến sĩ và đặt hầm chỉ huy của Thành ủy — và được công nhận Di tích lịch sử kháng chiến cấp thành phố năm 2005.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Pho Chieu Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Phổ Chiếu tọa lạc tại khu Quán Nải, phường Dư Hàng Kênh, quận Lê Chân, cách trung tâm thành phố Hải Phòng khoảng 1,5 km. Dù mới hình thành từ thập niên 1950, chùa mang dáng vẻ cổ kính trang nghiêm với nhiều công trình độc đáo trong khuôn viên.",
        },
        {
          heading: "Lịch sử",
          text: "Năm 1953, sư Ngộ Chân Tử từ Thái Bình đến đây \"trấn tích khai môn\" dựng chùa, ban đầu gọi là Tam Giáo đường, thờ cả Phật giáo, Nho giáo và Lão giáo — thể hiện khát vọng hòa hợp tôn giáo, hòa hợp dân tộc. Năm 1954, hòa thượng Thích Thanh Quang thuộc thiền phái Lâm Tế về trụ trì, chỉnh sửa thành ngôi chùa thờ Phật và đổi tên là chùa Phổ Chiếu. Sau nhiều hư hỏng do chiến tranh, chùa được trùng tu lớn từ năm 1985.",
        },
        {
          heading: "Di tích cách mạng",
          text: "Khu vực chùa từng là cơ sở bí mật nuôi giấu chiến sĩ cách mạng những năm 1929–1930 và 1939–1940. Giai đoạn 1954–1955, Liên hiệp Công đoàn thành phố chọn chùa làm nơi hội họp, chỉ đạo đấu tranh chống địch di chuyển máy móc và cưỡng ép người di cư vào Nam. Trong kháng chiến chống Mỹ, chùa là nơi đặt một trong bốn căn hầm của Thành ủy, Ủy ban nhân dân thành phố và Sở chỉ huy công an. Ngày 24 tháng 10 năm 2005, chùa Phổ Chiếu được công nhận Di tích lịch sử kháng chiến cấp thành phố.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Pho Chieu Pagoda stands in Du Hang Kenh ward, Le Chan district, about 1.5 km from central Hai Phong. Although founded only in the 1950s, it has the solemn, ancient look of an old temple with several distinctive structures in its grounds.",
        },
        {
          heading: "History",
          text: "In 1953 the monk Ngo Chan Tu from Thai Binh founded the temple, initially called the Tam Giao Hall, devoted jointly to Buddhism, Confucianism and Taoism as an expression of religious and national harmony. In 1954 Venerable Thich Thanh Quang of the Lam Te (Linji) Zen school became abbot, converted it into a purely Buddhist pagoda and renamed it Pho Chieu. Heavily damaged in wartime, it underwent a major restoration from 1985.",
        },
        {
          heading: "Revolutionary relic",
          text: "The pagoda's grounds secretly sheltered revolutionary fighters in 1929–1930 and 1939–1940. In 1954–1955 the city Trade Union Federation used it as a meeting place to direct struggles against the removal of machinery and forced migration to the South. During the war against the United States it housed one of four command bunkers of the municipal Party Committee, People's Committee and police headquarters. On 24 October 2005 it was recognized as a city-level resistance-history relic.",
        },
      ],
      references: [
        "https://lichsudangbo.haiphong.gov.vn/di-tich-lsvh-quan-le-chan/chua-pho-chieu-2953",
        "https://haiphongnews.gov.vn/vn/du-lich/chua-pho-chieu-chon-thanh-tinh-giua-long-dat-cang-ct506.html",
      ],
    },
  },
];

const pagodas = JSON.parse(fs.readFileSync(pagodasPath, "utf8"));
const details = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

const existingSlugs = new Set(pagodas.map((p) => p.slug));
let added = 0;
for (const { pagoda, details: d } of CURATED) {
  if (existingSlugs.has(pagoda.slug)) {
    console.error(`Skip (exists): ${pagoda.slug}`);
    continue;
  }
  let idx = -1;
  for (let i = 0; i < pagodas.length; i++) {
    if (pagodas[i].province === pagoda.province) idx = i;
  }
  pagodas.splice(idx + 1, 0, pagoda);
  details[pagoda.slug] = d;
  added++;
}

fs.writeFileSync(pagodasPath, JSON.stringify(pagodas, null, 2));
fs.writeFileSync(detailsPath, JSON.stringify(details));
console.log(`Added ${added} curated Hải Phòng entries. Total: ${pagodas.length}`);
