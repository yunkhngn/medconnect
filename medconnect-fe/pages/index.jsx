import { Default } from "../components/layouts/";
import { Card, CardBody, Button, Chip, Avatar } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import Float from "@/components/ui/Float";

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      title: "Search for branch",
      description: "Tìm phòng khám, nha khoa, bác sĩ gần bạn với đánh giá rõ ràng"
    },
    {
      title: "Cosmetic Dentistry",
      description: "Hiểu đúng về răng sứ thẩm mỹ và các quy trình an toàn"
    },
    {
      title: "Small changes, big impact",
      description: "Chăm sóc định kỳ giúp ngừa bệnh và tiết kiệm chi phí"
    }
  ];

  const services = [
    { title: "General Checkup", desc: "Khám tổng quát định kỳ", icon: "🩺" },
    { title: "Pediatrics", desc: "Chăm sóc sức khỏe trẻ em", icon: "🧒" },
    { title: "Cardiology", desc: "Tim mạch chuyên sâu", icon: "❤️" },
    { title: "Dentistry", desc: "Nha khoa thẩm mỹ & điều trị", icon: "🦷" },
    { title: "Mental Health", desc: "Tư vấn tâm lý", icon: "🧠" },
    { title: "Lab Tests", desc: "Xét nghiệm nhanh & chuẩn", icon: "🧪" }
  ];

  const doctors = [
    { name: "BS. Nguyễn Văn A", specialty: "Tim mạch", years: 15, avatar: "/assets/homepage/mockup-avatar.jpg" },
    { name: "BS. Trần Thị B", specialty: "Nội khoa", years: 12, avatar: "/assets/homepage/mockup-avatar.jpg" },
    { name: "BS. Lê Văn C", specialty: "Nhi khoa", years: 10, avatar: "/assets/homepage/mockup-avatar.jpg" },
    { name: "BS. Phạm D", specialty: "Răng hàm mặt", years: 8, avatar: "/assets/homepage/mockup-avatar.jpg" }
  ];

  const testimonials = [
    { name: "Maria Reed", quote: "Bác sĩ tận tâm, quy trình gọn nhẹ.", role: "Patient", avatar: "/assets/homepage/mockup-avatar.jpg" },
    { name: "Brian Kim", quote: "Đặt lịch 5 phút, không phải chờ.", role: "Patient", avatar: "/assets/homepage/mockup-avatar.jpg" },
    { name: "Lan Phạm", quote: "Kết quả xét nghiệm có trong ngày.", role: "Patient", avatar: "/assets/homepage/mockup-avatar.jpg" }
  ];

  const articles = [
    { title: "5 dấu hiệu cần đi khám ngay", tag: "Health", cover: "/assets/homepage/cover.jpg" },
    { title: "Hiểu đúng về bệnh răng miệng", tag: "Dentistry", cover: "/assets/homepage/cover.jpg" },
    { title: "Thói quen ngủ và sức khỏe tinh thần", tag: "Mental", cover: "/assets/homepage/cover.jpg" }
  ];

  const faqs = [
    { q: "Làm sao để đặt lịch?", a: "Chọn chuyên khoa → Chọn bác sĩ → Chọn giờ → Xác nhận." },
    { q: "Thanh toán thế nào?", a: "Hỗ trợ ví điện tử, thẻ, hoặc thanh toán tại cơ sở." },
    { q: "Có hủy lịch được không?", a: "Được hủy miễn phí trước 2 giờ so với lịch hẹn." }
  ];

  return (
    <Default>
      {/* HERO - Background không cần Float */}
      <section className="relative overflow-hidden rounded-2xl mx-2 sm:mx-4 md:mx-6 mt-4 sm:mt-6 md:mt-1">
        {/* gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#f1e1ff] via-[#ffe6ea] to-[#e6f0ff]" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/60 blur-2xl" />
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 md:py-16 items-center">
          {/* Left copy */}
          <Float variant="fadeInUp">
            <div>
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-5">
                <span className="inline-flex h-5 sm:h-6 items-center rounded-full bg-white/70 px-2 sm:px-3">MedConnect</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                MedConnect
                <br />
                Platform
              </h1>
              <p className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg text-gray-700 max-w-xl">
                Hệ thống MedConnect cung cấp dịch vụ khám chữa bệnh từ xa tiện lợi và nhanh chóng.
              </p>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link href="/tim-bac-si"
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-center text-white bg-primary hover:bg-primary/90 text-sm sm:text-base md:text-lg"
                >
                  Tìm bác sĩ
                </Link>
                <Link href="/dang-ky"
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-center text-primary hover:bg-gray-100 text-sm sm:text-base md:text-lg"
                >
                  Đăng ký miễn phí
                </Link>
              </div>

              {/* mini cards under CTA */}
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                <Float variant="scaleIn" delay={0.1}>
                  <Card className="w-full sm:w-60 bg-white/80 backdrop-blur">
                    <CardBody className="p-3 sm:p-4 flex items-center gap-3">
                      <Avatar src="/assets/homepage/mockup-avatar.jpg" radius="md" className="w-10 h-10 sm:w-12 sm:h-12" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Bác sĩ online</p>
                        <p className="font-semibold text-sm sm:text-base">Nói chuyện với hơn 285 bác sĩ</p>
                      </div>
                    </CardBody>
                  </Card>
                </Float>

                <Float variant="scaleIn" delay={0.15}>
                  <Card className="w-full sm:w-52 bg-white/80 backdrop-blur">
                    <CardBody className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm text-gray-600">Người dùng</p>
                        <Chip size="sm" color="warning" variant="flat">+18%</Chip>
                      </div>
                      <p className="mt-2 text-xl sm:text-2xl font-bold">94.5<span className="text-sm sm:text-base align-top">/pt</span></p>
                      <p className="text-xs text-gray-500">↑ 2.7% từ tuần trước</p>
                    </CardBody>
                  </Card>
                </Float>
              </div>
            </div>
          </Float>

          {/* Right hero visual */}
          <div className="relative min-h-[300px] sm:min-h-[380px] md:min-h-[520px] mt-8 lg:mt-0">
            {/* background circle */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 sm:h-80 sm:w-80 md:h-[28rem] md:w-[28rem] rounded-full bg-white/70" />
            {/* hero image */}
            <Image
              src="/assets/homepage/cover.jpg"
              alt="Doctor hero"
              fill
              className="object-cover rounded-2xl opacity-80"
              priority
            />

            {/* floating chips */}
            <Float variant="fadeInRight" delay={0.2}>
              <div className="absolute right-4 sm:right-6 top-4 sm:top-6 flex flex-wrap gap-1 sm:gap-2">
                <Chip variant="flat" color="secondary" size="sm">TeleMedicine</Chip>
                <Chip variant="flat" color="primary" size="sm">24/7</Chip>
                <Chip variant="flat" color="success" size="sm">Online</Chip>
              </div>
            </Float>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <Float variant="fadeInUp">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Tại sao chọn MedConnect?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Chúng tôi mang đến trải nghiệm chăm sóc sức khỏe hiện đại
              </p>
            </div>
          </Float>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((f, i) => (
              <Float key={i} variant="fadeInUp" delay={i * 0.05}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{f.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{f.description}</p>
                  </CardBody>
                </Card>
              </Float>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Float variant="fadeInUp">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Dịch vụ chăm sóc sức khỏe
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Đa dạng chuyên khoa phục vụ nhu cầu của bạn
              </p>
            </div>
          </Float>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((s, i) => (
              <Float key={i} variant="scaleIn" delay={i * 0.05}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-4 sm:p-6">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{s.desc}</p>
                  </CardBody>
                </Card>
              </Float>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16 bg-gradient-to-tr from-[#f1e1ff] via-[#ffe6ea] to-[#e6f0ff]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center text-gray-900">
            {[
              {k:"Bác sĩ",v:"1,200+"},
              {k:"Bệnh nhân",v:"80K+"},
              {k:"Lịch hẹn",v:"200K+"},
              {k:"Đánh giá",v:"4.9/5"}
            ].map((it, idx)=>(
              <Float key={idx} variant="scaleIn" delay={idx * 0.05}>
                <div>
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">{it.v}</p>
                  <p className="text-sm sm:text-base text-gray-700">{it.k}</p>
                </div>
              </Float>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <Float variant="fadeInUp">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Đội ngũ bác sĩ chuyên nghiệp
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Các bác sĩ hàng đầu luôn sẵn sàng phục vụ bạn
              </p>
            </div>
          </Float>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {doctors.map((d, i) => (
              <Float key={i} variant="fadeInUp" delay={i * 0.05}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-4 sm:p-6 text-center">
                    <Avatar src={d.avatar} className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4" />
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900">{d.name}</h3>
                    <Chip size="sm" variant="flat" color="primary" className="my-2 m-auto mb-2 mt-2">{d.specialty}</Chip>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Kinh nghiệm {d.years} năm</p>
                    <Button size="sm" color="primary" variant="light" fullWidth onPress={() => router.push("/tim-bac-si")}>
                      Đặt lịch khám
                    </Button>
                  </CardBody>
                </Card>
              </Float>
            ))}
          </div>
          <Float variant="fadeInUp" delay={0.3}>
            <div className="text-center mt-6 sm:mt-8">
              <Link href="/tim-bac-si"
              className="px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-center text-primary hover:bg-gray-100 text-sm sm:text-base md:text-lg"
              >
                Xem tất cả bác sĩ
              </Link>
            </div>
          </Float>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Float variant="fadeInUp">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Bệnh nhân nói gì về chúng tôi
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Hơn 80,000 bệnh nhân đã tin tưởng sử dụng dịch vụ
              </p>
            </div>
          </Float>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <Float key={i} variant="fadeInLeft" delay={i * 0.1}>
                <Card className="border-none shadow-sm">
                  <CardBody className="p-4 sm:p-6">
                    <p className="text-sm sm:text-base text-gray-700 italic mb-3 sm:mb-4">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar src={t.avatar} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.role}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Float>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-4 sm:px-6 md:px-10 lg:px-16 py-16 sm:py-20">
        {/* pastel gradient backdrop + blurred shapes (matches hero) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#f1e1ff] via-[#ffe6ea] to-[#e6f0ff] opacity-60" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/60 blur-2xl" />
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />

        <Float variant="fadeInUp">
          <div className="relative max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white/70 backdrop-blur-lg shadow-lg border border-white/30 overflow-hidden">
              <div className="p-6 sm:p-8 md:p-10">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                    Sẵn sàng chăm sóc sức khỏe tốt hơn?
                  </h2>
                  <p className="mt-3 text-gray-700 text-sm sm:text-base md:text-lg max-w-xl">
                    Đặt lịch nhanh, tư vấn chuyên môn và nhận chăm sóc liên tục từ đội ngũ bác sĩ của chúng tôi.
                  </p>
                  <p className="mt-4 text-xs sm:text-sm text-gray-500">
                    Không phí ẩn — Hỗ trợ mọi lúc, mọi nơi.
                  </p>
                   <Link href="/dang-ky" 
                   className="mt-4 sm:mt-6 inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-center text-white bg-primary hover:bg-primary/90 text-sm sm:text-base md:text-lg">
                    Đăng ký ngay
                   </Link>
                </div>
              </div>
            </div>
          </div>
        </Float>
      </section>
    </Default>
  );
}