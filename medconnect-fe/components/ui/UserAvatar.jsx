import { useEffect, useState, forwardRef } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useAvatar } from '@/hooks/useAvatar';

/**
 * UserAvatar Component - Hiển thị avatar với priority:
 * 1. Custom uploaded avatar (Cloudinary)
 * 2. Gmail profile photo (Firebase)
 * 3. Default mockup avatar
 */
const UserAvatar = forwardRef(({ 
  size = 40,
  className = '',
  showBorder = true,
  asButton = false,
  ...props 
}, ref) => {
  const { getAvatarUrl } = useAvatar();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!isMounted) return;
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch custom avatar from backend
          const token = await firebaseUser.getIdToken();
          const response = await fetch('http://localhost:8080/api/avatar', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok && isMounted) {
            const data = await response.json();
            const finalUrl = getAvatarUrl(firebaseUser, data.avatarUrl);
            setAvatarUrl(finalUrl);
          } else if (isMounted) {
            // Fallback to Gmail photo or generated avatar
            const fallbackUrl = getAvatarUrl(firebaseUser, null);
            setAvatarUrl(fallbackUrl);
          }
        } catch (error) {
          console.error('Error fetching avatar:', error);
          if (isMounted) {
            // Fallback to Gmail photo or generated avatar
            const fallbackUrl = getAvatarUrl(firebaseUser, null);
            setAvatarUrl(fallbackUrl);
          }
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [getAvatarUrl]);

  // Use mockup avatar as fallback (no generated avatar)
  const finalAvatarUrl = avatarUrl || '/assets/homepage/mockup-avatar.jpg';
  
  const baseClasses = `relative rounded-full overflow-hidden ${showBorder ? 'ring-2 ring-cyan-100' : ''} ${className}`;
  const buttonClasses = asButton ? 'cursor-pointer transition-transform hover:scale-105' : '';
  const Tag = asButton ? 'button' : 'div';

  if (loading) {
    return (
      <Tag
        ref={ref}
        className={`${baseClasses} bg-gray-200 animate-pulse`}
        style={{ width: size, height: size }}
        {...props}
      >
        <div className="w-full h-full flex items-center justify-center">
          <User className="text-gray-400" size={size * 0.5} />
        </div>
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={`${baseClasses} ${buttonClasses}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <Image
        src={finalAvatarUrl}
        alt={user?.email || 'User Avatar'}
        fill
        sizes={`${size}px`}
        className="object-cover"
        priority={false}
        quality={60}
        onError={(e) => {
          e.currentTarget.src = '/assets/homepage/mockup-avatar.jpg';
        }}
      />
    </Tag>
  );
});

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;

