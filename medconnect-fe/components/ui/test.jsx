// components/DoctorDashboardButton.jsx
import { useRouter } from 'next/router';

export default function DoctorDashboardButton() {
  const router = useRouter();

  const handleClick = (role) => {
    router.push(`/${role}/trang-chu`); 
  };

  return (
    <div style={{marginTop: '20px'}}>
      <button
      onClick={() => handleClick('bac-si')}
      style={{
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginRight: '10px',
      }}
    >
      Truy cập Dashboard Bác sĩ
    </button>
    <button
      onClick={() => handleClick('admin')}
      style={{
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Truy cập Dashboard Admin
    </button>
    </div>
  );
}
