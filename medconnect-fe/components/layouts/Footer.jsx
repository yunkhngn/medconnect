import React from 'react';
import {Link, Divider} from '@heroui/react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer role="contentinfo">
      <Divider />
      <div className="footer-content" style={{padding: '2rem 1rem', maxWidth: 1200, margin: '0 auto'}}>
        <div className="footer-grid" style={{display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'}}>
          {/* Brand */}
          <section>
            <h3 style={{margin: 0, fontSize: '1.25rem', fontWeight: 700}}>MedConnect</h3>
            <p style={{marginTop: '.5rem', color: 'var(--nextui-colors-foreground-600, #666)'}}>
              Kết nối bệnh nhân và bác sĩ qua đặt lịch và tư vấn trực tuyến.
            </p>
          </section>


          <section>
            <h4 style={{margin: 0, fontSize: '1rem', fontWeight: 600}}>Điều hướng</h4>
            <nav style={{marginTop: '.5rem', display: 'flex', flexDirection: 'column', gap: '.375rem'}}>
              <Link href="/" color="foreground" underline="hover">Trang chủ</Link>
              <Link href="/doctors" color="foreground" underline="hover">Bác sĩ</Link>
              <Link href="/appointments" color="foreground" underline="hover">Lịch hẹn</Link>
              <Link href="/about" color="foreground" underline="hover">Về MedConnect</Link>
              <Link href="/contact" color="foreground" underline="hover">Liên hệ</Link>
            </nav>
          </section>
          <section>
            <h4 style={{margin: 0, fontSize: '1rem', fontWeight: 600}}>Hỗ trợ</h4>
            <ul style={{listStyle: 'none', padding: 0, marginTop: '.5rem'}}>
              <li><Link href="/faq" color="foreground" underline="hover">FAQ</Link></li>
              <li><Link href="/policy/privacy" color="foreground" underline="hover">Chính sách bảo mật</Link></li>
              <li><Link href="/policy/terms" color="foreground" underline="hover">Điều khoản sử dụng</Link></li>
            </ul>
          </section>
        </div>
      </div>
      <Divider />
      <div style={{padding: '1rem', textAlign: 'center', fontSize: '.9rem', color: 'var(--nextui-colors-foreground-600, #666)'}}>
        © {year} MedConnect. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;