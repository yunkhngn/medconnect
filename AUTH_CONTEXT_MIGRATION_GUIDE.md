# Auth Context Migration Guide

## Vấn đề đã fix
- ✅ Blank screen khi reload trang
- ✅ Xung đột khi nhiều page cùng gọi `auth.onAuthStateChanged()`
- ✅ User state không được share giữa các components

## Giải pháp
Đã tạo **AuthContext** và **useAuth hook** để quản lý user state tập trung.

## Cách dùng trong các trang mới

### ❌ BEFORE (Cũ - Gây blank screen khi reload)
```jsx
import { auth } from "@/lib/firebase";

export default function MyPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      // ... fetch data
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  // ...
}
```

### ✅ AFTER (Mới - Không bị blank screen)
```jsx
import { useAuth } from "@/contexts/AuthContext";

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Chờ auth xong
    
    if (!user) {
      // Handle no user
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = await user.getIdToken();
        // ... fetch data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);
  
  if (authLoading || loading) {
    return <LoadingSpinner />;
  }
  
  // ...
}
```

## Các trang cần migrate

### Patient Pages
- ✅ `/nguoi-dung/ho-so-benh-an.jsx` - ĐÃ FIX
- ⚠️ `/nguoi-dung/ho-so-benh-an/chinh-sua.jsx` - CẦN FIX
- ⚠️ `/nguoi-dung/ho-so-benh-an/tao-moi.jsx` - CẦN FIX  
- ⚠️ `/nguoi-dung/cai-dat.jsx` - CẦN FIX
- ⚠️ `/nguoi-dung/trang-chu.jsx` - CẦN FIX
- ⚠️ `/nguoi-dung/lich-hen.jsx` - CẦN FIX

### Doctor Pages
- ⚠️ `/bac-si/ho-so.jsx` - CẦN FIX
- ⚠️ `/bac-si/cai-dat.jsx` - CẦN FIX
- ⚠️ `/bac-si/trang-chu.jsx` - CẦN FIX
- ⚠️ `/bac-si/lich-hen.jsx` - CẦN FIX
- ⚠️ `/bac-si/lich-lam-viec.jsx` - CẦN FIX

### Admin Pages
- ⚠️ Tất cả các trang admin

## Migration Steps (Từng bước)

1. **Import useAuth**
```jsx
import { useAuth } from "@/contexts/AuthContext";
```

2. **Thay thế user state**
```jsx
// ❌ XÓA
const [user, setUser] = useState(null);

// ✅ THÊM
const { user, loading: authLoading } = useAuth();
```

3. **Xóa auth.onAuthStateChanged**
```jsx
// ❌ XÓA toàn bộ
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
    setUser(firebaseUser);
    // ...
  });
  return () => unsubscribe();
}, []);
```

4. **Update useEffect để check authLoading**
```jsx
useEffect(() => {
  if (authLoading) return; // Thêm dòng này
  
  if (!user) {
    // Handle not logged in
    return;
  }

  // Fetch data...
}, [user, authLoading]); // Thêm dependencies
```

5. **Update loading check**
```jsx
if (authLoading || loading) {
  return <LoadingSpinner />;
}
```

## Lợi ích

✅ **Không bị blank screen khi reload**
✅ **User state được share toàn app**
✅ **Code sạch hơn, ít duplicate**
✅ **Performance tốt hơn (chỉ 1 auth listener)**
✅ **Dễ maintain và debug**

## Notes

- AuthContext đã được setup sẵn trong `_app.jsx`
- Không cần import `auth` từ firebase nữa (trừ khi cần logout)
- User object là Firebase User, có đầy đủ methods như `getIdToken()`, `email`, etc.

