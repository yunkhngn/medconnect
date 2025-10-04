import React from 'react';
import Slider from 'react-slick';
import Head from 'next/head';
import {Card, CardBody, Button, Chip} from '@heroui/react';

const slides = [
  {
    id: 1,
    title: 'Đặt lịch khám nhanh',
    subtitle: 'Tìm bác sĩ phù hợp trong vài giây',
    img: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=1600&auto=format&fit=crop',
    cta: {text: 'Bắt đầu', link: '/doctors'},
  },
  {
    id: 2,
    title: 'Tư vấn video từ xa',
    subtitle: 'Kết nối an toàn, bảo mật',
    img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1600&auto=format&fit=crop',
    cta: {text: 'Xem hướng dẫn', link: '/about'},
  },
  {
    id: 3,
    title: 'Nhắc lịch và hồ sơ số',
    subtitle: 'Theo dõi khám chữa bệnh gọn nhẹ',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop',
    cta: {text: 'Quản lý lịch hẹn', link: '/appointments'},
  },
];

const NextArrow = (props) => {
  const {className, style, onClick} = props;
  return (
    <button
      aria-label="next slide"
      className={className}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        right: 10,
        zIndex: 2,
        width: 40,
        height: 40,
        borderRadius: 999,
        background: 'rgba(0,0,0,.45)',
        border: 'none',
      }}
      onClick={onClick}
    />
  );
};

const PrevArrow = (props) => {
  const {className, style, onClick} = props;
  return (
    <button
      aria-label="previous slide"
      className={className}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        left: 10,
        zIndex: 2,
        width: 40,
        height: 40,
        borderRadius: 999,
        background: 'rgba(0,0,0,.45)',
        border: 'none',
      }}
      onClick={onClick}
    />
  );
};

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    adaptiveHeight: true,
    dotsClass: 'slick-dots slick-thumb',
    appendDots: (dots) => (
      <div style={{ bottom: 10 }}>
        <ul style={{ margin: 0 }}> {dots} </ul>
      </div>
    ),
    customPaging: () => (
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: 999,
          background: 'rgba(255,255,255,.6)',
        }}
      />
    ),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
  };

  return (
    <section style={{position: 'relative'}}>
      <Head>
        <link
          rel="stylesheet"
          type="text/css"
          charSet="UTF-8"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
      </Head>

      <div style={{maxWidth: 1200, margin: '0 auto', borderRadius: 16, overflow: 'hidden'}}>
        <Slider {...settings}>
          {slides.map((s) => (
            <div key={s.id}>
              <div style={{position: 'relative', height: 420, background: '#000'}}>
                <img
                  src={s.img}
                  alt={s.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    filter: 'brightness(0.8)'
                  }}
                />

                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center'}}>
                  <Card
                    radius="lg"
                    style={{
                      marginLeft: 24,
                      maxWidth: 520,
                      background: 'rgba(255,255,255,.9)',
                      backdropFilter: 'saturate(180%) blur(8px)'
                    }}
                  >
                    <CardBody>
                      <h2 style={{margin: 0, fontSize: '1.75rem', lineHeight: 1.2}}>{s.title}</h2>
                      <p style={{marginTop: 8, color: 'var(--nextui-colors-foreground-600, #555)'}}>{s.subtitle}</p>
                      <Button
                        as="a"
                        href={s.cta.link}
                        color="primary"
                        variant="solid"
                        style={{marginTop: 12, alignSelf: 'flex-start'}}
                      >
                        {s.cta.text}
                      </Button>
                    </CardBody>
                  </Card>
                </div>
              </div>
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 12,
                  background: '#fff',
                  display: 'flex',
                  gap: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  justifyContent: 'space-between',
                  maxWidth: 1200,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
                  <div style={{fontSize: 24}}>📞</div>
                  <strong style={{marginTop: 8}}>Gọi tổng đài</strong>
                  <span style={{fontSize: 14, color: '#555', marginTop: 4}}>Tư vấn và giải đáp các vấn đề của bạn</span>
                </div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
                  <div style={{fontSize: 24}}>📅</div>
                  <strong style={{marginTop: 8}}>Đặt Lịch Hẹn</strong>
                  <span style={{fontSize: 14, color: '#555', marginTop: 4}}>Đặt lịch hẹn nhanh chóng, tiện lợi</span>
                </div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
                  <div style={{fontSize: 24}}>👨‍⚕️</div>
                  <strong style={{marginTop: 8}}>Tìm bác sĩ</strong>
                  <span style={{fontSize: 14, color: '#555', marginTop: 4}}>Tìm kiếm thông tin chuyên gia y tế nhanh chóng</span>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Carousel;