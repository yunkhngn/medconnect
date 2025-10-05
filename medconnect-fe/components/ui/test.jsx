// components/DoctorDashboardButton.jsx
import { useRouter } from 'next/router';

export default function DoctorDashboardButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/doctor/dashboard');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Truy cập Dashboard Bác sĩ
    </button>
  );
}
