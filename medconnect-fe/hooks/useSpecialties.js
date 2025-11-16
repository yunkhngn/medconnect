import { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/api';

/**
 * Hook to fetch and manage specialties from backend
 * Returns specialties map and loading state
 */
export function useSpecialties() {
  const [specialtiesMap, setSpecialtiesMap] = useState({});
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${getApiUrl()}/specialties`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data)) {
            // Create map for backward compatibility with enum format
            // Backend returns actual names, but some old data might use enum format
            const map = {};
            data.forEach((spec) => {
              if (spec.name) {
                // Map by actual name (primary)
                map[spec.name] = spec.name;
                
                // Also map by enum format for backward compatibility
                // Convert "Tim mạch" -> "TIM_MACH"
                const upperKey = spec.name.toUpperCase()
                  .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'A')
                  .replace(/[èéẹẻẽêềếệểễ]/g, 'E')
                  .replace(/[ìíịỉĩ]/g, 'I')
                  .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'O')
                  .replace(/[ùúụủũưừứựửữ]/g, 'U')
                  .replace(/[ỳýỵỷỹ]/g, 'Y')
                  .replace(/đ/g, 'D')
                  .replace(/\s+/g, '_')
                  .replace(/[^A-Z0-9_]/g, '');
                map[upperKey] = spec.name;
                
                // Also map by ID if available
                if (spec.id) {
                  map[spec.id] = spec.name;
                }
              }
            });
            
            setSpecialtiesMap(map);
            setSpecialtiesList(data);
          }
        }
      } catch (error) {
        console.error('Error fetching specialties:', error);
        // Fallback to empty map
        setSpecialtiesMap({});
        setSpecialtiesList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  /**
   * Get specialty label by key (enum, name, or ID)
   * @param {string|number} specialtyKey - Can be enum format (TIM_MACH), name (Tim mạch), or ID
   * @returns {string} The display name of the specialty
   */
  const getSpecialtyLabel = (specialtyKey) => {
    if (!specialtyKey) return "Đa khoa";
    
    // If already loaded and found in map, return it
    if (!loading && specialtiesMap[specialtyKey]) {
      return specialtiesMap[specialtyKey];
    }
    
    // If specialtyKey looks like a name (contains spaces or Vietnamese characters), return as is
    if (typeof specialtyKey === 'string' && /[\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(specialtyKey)) {
      return specialtyKey;
    }
    
    // Try uppercase enum format
    const upperKey = String(specialtyKey).toUpperCase().replace(/\s+/g, '_');
    if (!loading && specialtiesMap[upperKey]) {
      return specialtiesMap[upperKey];
    }
    
    // If not found and still loading, return the key as fallback
    if (loading) {
      return specialtyKey || "Đa khoa";
    }
    
    // Final fallback
    return specialtyKey || "Đa khoa";
  };

  return {
    specialtiesMap,
    specialtiesList,
    loading,
    getSpecialtyLabel,
  };
}

