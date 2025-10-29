import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to fetch Vietnam administrative divisions
 * API: https://provinces.open-api.vn/api/v2/
 */
export const useAddressData = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });
  const [error, setError] = useState(null);

  const API_BASE = 'https://provinces.open-api.vn/api';

  // Fetch all provinces (on mount)
  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/p/`);
      if (!response.ok) throw new Error('Failed to fetch provinces');
      const data = await response.json();
      setProvinces(data);
    } catch (err) {
      console.error('[useAddressData] Error fetching provinces:', err);
      setError(err.message);
      setProvinces([]);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  // Fetch districts by province code
  const fetchDistricts = useCallback(async (provinceCode) => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }

    setLoading(prev => ({ ...prev, districts: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      const data = await response.json();
      setDistricts(data.districts || []);
      setWards([]); // Reset wards when province changes
    } catch (err) {
      console.error('[useAddressData] Error fetching districts:', err);
      setError(err.message);
      setDistricts([]);
      setWards([]);
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  }, []);

  // Fetch wards by district code
  const fetchWards = useCallback(async (districtCode) => {
    if (!districtCode) {
      setWards([]);
      return;
    }

    setLoading(prev => ({ ...prev, wards: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
      if (!response.ok) throw new Error('Failed to fetch wards');
      const data = await response.json();
      setWards(data.wards || []);
    } catch (err) {
      console.error('[useAddressData] Error fetching wards:', err);
      setError(err.message);
      setWards([]);
    } finally {
      setLoading(prev => ({ ...prev, wards: false }));
    }
  }, []);

  // Helper to find full name by code
  const getProvinceName = useCallback((code) => {
    const province = provinces.find(p => p.code === parseInt(code));
    return province?.name || '';
  }, [provinces]);

  const getDistrictName = useCallback((code) => {
    const district = districts.find(d => d.code === parseInt(code));
    return district?.name || '';
  }, [districts]);

  const getWardName = useCallback((code) => {
    const ward = wards.find(w => w.code === parseInt(code));
    return ward?.name || '';
  }, [wards]);

  // Get full address string
  const getFullAddress = useCallback((provinceCode, districtCode, wardCode, addressDetail = '') => {
    const parts = [];
    if (addressDetail) parts.push(addressDetail);
    if (wardCode) parts.push(getWardName(wardCode));
    if (districtCode) parts.push(getDistrictName(districtCode));
    if (provinceCode) parts.push(getProvinceName(provinceCode));
    return parts.join(', ');
  }, [getProvinceName, getDistrictName, getWardName]);

  return {
    provinces,
    districts,
    wards,
    loading,
    error,
    fetchDistricts,
    fetchWards,
    getProvinceName,
    getDistrictName,
    getWardName,
    getFullAddress,
  };
};

