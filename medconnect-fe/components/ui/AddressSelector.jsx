"use client";
import { Select, SelectItem } from '@heroui/react';
import { useAddressData } from '../../hooks/useAddressData';
import { useEffect } from 'react';

/**
 * Reusable Address Selector Component
 * Cascading dropdowns: Province → District → Ward
 */
export default function AddressSelector({
  provinceCode,
  districtCode,
  wardCode,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  disabled = false,
  required = false,
  size = 'md',
  variant = 'bordered',
  label = {
    province: 'Tỉnh/Thành phố',
    district: 'Quận/Huyện',
    ward: 'Phường/Xã',
  },
}) {
  const {
    provinces,
    districts,
    wards,
    loading,
    error,
    fetchDistricts,
    fetchWards,
  } = useAddressData();

  // Fetch districts when province changes
  useEffect(() => {
    if (provinceCode) {
      fetchDistricts(provinceCode);
    }
  }, [provinceCode, fetchDistricts]);

  // Fetch wards when district changes
  useEffect(() => {
    if (districtCode) {
      fetchWards(districtCode);
    }
  }, [districtCode, fetchWards]);

  const handleProvinceChange = (keys) => {
    const code = Array.isArray(keys)
      ? keys[0]
      : (typeof keys === 'string' ? keys : Array.from(keys || [])[0]);
    onProvinceChange(code || null);
    // Reset district and ward when province changes
    onDistrictChange(null);
    onWardChange(null);
  };

  const handleDistrictChange = (keys) => {
    const code = Array.isArray(keys)
      ? keys[0]
      : (typeof keys === 'string' ? keys : Array.from(keys || [])[0]);
    onDistrictChange(code || null);
    // Reset ward when district changes
    onWardChange(null);
  };

  const handleWardChange = (keys) => {
    const code = Array.isArray(keys)
      ? keys[0]
      : (typeof keys === 'string' ? keys : Array.from(keys || [])[0]);
    onWardChange(code || null);
  };

  if (error) {
    return (
      <div className="text-danger text-sm p-2 bg-danger-50 rounded-lg">
        ⚠️ Lỗi tải dữ liệu địa chỉ: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Province Selector */}
      <Select
        label={label.province}
        placeholder="Chọn tỉnh/thành"
        selectedKeys={provinceCode ? new Set([String(provinceCode)]) : new Set()}
        onSelectionChange={handleProvinceChange}
        isDisabled={disabled || loading.provinces}
        isLoading={loading.provinces}
        isRequired={required}
        selectionMode="single"
        disallowEmptySelection={false}
        size={size}
        variant={variant}
        classNames={{
          trigger: 'border-gray-300 hover:border-teal-500 focus:border-teal-500',
        }}
      >
        {provinces.map((province) => (
          <SelectItem key={String(province.code)}>
            {province.name}
          </SelectItem>
        ))}
      </Select>

      {/* District Selector */}
      <Select
        label={label.district}
        placeholder="Chọn quận/huyện"
        selectedKeys={districtCode ? new Set([String(districtCode)]) : new Set()}
        onSelectionChange={handleDistrictChange}
        isDisabled={disabled || !provinceCode || loading.districts}
        isLoading={loading.districts}
        isRequired={required}
        selectionMode="single"
        disallowEmptySelection={false}
        size={size}
        variant={variant}
        classNames={{
          trigger: 'border-gray-300 hover:border-teal-500 focus:border-teal-500',
        }}
      >
        {districts.map((district) => (
          <SelectItem key={String(district.code)}>
            {district.name}
          </SelectItem>
        ))}
      </Select>

      {/* Ward Selector */}
      <Select
        label={label.ward}
        placeholder="Chọn phường/xã"
        selectedKeys={wardCode ? new Set([String(wardCode)]) : new Set()}
        onSelectionChange={handleWardChange}
        isDisabled={disabled || !districtCode || loading.wards}
        isLoading={loading.wards}
        isRequired={required}
        selectionMode="single"
        disallowEmptySelection={false}
        size={size}
        variant={variant}
        classNames={{
          trigger: 'border-gray-300 hover:border-teal-500 focus:border-teal-500',
        }}
      >
        {wards.map((ward) => (
          <SelectItem key={String(ward.code)}>
            {ward.name}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}

