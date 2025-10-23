import { useState, useEffect } from 'react';
import { Input } from '@heroui/react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

/**
 * Danh sách mã đối tượng BHYT hợp lệ
 */
const VALID_BHYT_CODES = [
  // Nhóm NLĐ và người SDLĐ đóng
  'DN', 'HX', 'CH', 'NN', 'TK', 'HC', 'XK',
  // Nhóm tổ chức BHXH đóng
  'HT', 'TB', 'NO', 'CT', 'XB', 'TN', 'CS',
  // Nhóm NSNN đóng
  'QN', 'CA', 'CY', 'XN', 'MS', 'CC', 'CK', 'CB', 'KC', 
  'HD', 'TE', 'BT', 'HN', 'DT', 'DK', 'XD', 'TS', 'TC',
  'TQ', 'TV', 'TA', 'TY', 'HG', 'LS', 'PV',
  // Nhóm NSNN hỗ trợ
  'CN', 'HS', 'SV', 'GB',
  // Nhóm hộ gia đình
  'GD'
];

/**
 * Mapping mã đối tượng sang tên đối tượng
 */
const BHYT_CODE_NAMES = {
  'DN': 'NLĐ trong doanh nghiệp',
  'HX': 'NLĐ trong HTX',
  'CH': 'NLĐ trong cơ quan nhà nước',
  'NN': 'NLĐ làm việc cho tổ chức nước ngoài',
  'TK': 'NLĐ trong tổ chức khác',
  'HC': 'Cán bộ, công chức, viên chức',
  'XK': 'Người hoạt động không chuyên trách ở xã',
  'HT': 'Người hưởng lương hưu',
  'TB': 'Người hưởng trợ cấp TNLĐ-BNN',
  'NO': 'NLĐ nghỉ ốm dài ngày',
  'CT': 'Người từ 80 tuổi hưởng trợ cấp tuất',
  'XB': 'Cán bộ xã nghỉ việc',
  'TN': 'Người hưởng trợ cấp thất nghiệp',
  'CS': 'Công nhân cao su nghỉ việc',
  'QN': 'Quân nhân',
  'CA': 'Công an',
  'CY': 'Cán bộ cơ yếu',
  'XN': 'Cán bộ xã nghỉ việc (NSNN)',
  'MS': 'Người thôi hưởng trợ cấp MSLĐ',
  'CC': 'Người có công - nhóm 1',
  'CK': 'Người có công - nhóm 2',
  'CB': 'Cựu chiến binh',
  'KC': 'Người tham gia kháng chiến',
  'HD': 'Đại biểu Quốc hội/HĐND',
  'TE': 'Trẻ em dưới 6 tuổi',
  'BT': 'Người hưởng trợ cấp bảo trợ xã hội',
  'HN': 'Hộ nghèo',
  'DT': 'Dân tộc thiểu số',
  'DK': 'Vùng khó khăn đặc biệt',
  'XD': 'Xã đảo, huyện đảo',
  'TS': 'Thân nhân liệt sĩ',
  'TC': 'Thân nhân người có công',
  'TQ': 'Thân nhân quân nhân',
  'TV': 'Thân nhân CNVC quốc phòng',
  'TA': 'Thân nhân công an',
  'TY': 'Thân nhân cán bộ cơ yếu',
  'HG': 'Người hiến tặng bộ phận cơ thể',
  'LS': 'Lưu học sinh nước ngoài',
  'PV': 'Người phục vụ người có công',
  'CN': 'Hộ cận nghèo',
  'HS': 'Học sinh',
  'SV': 'Sinh viên',
  'GB': 'Hộ gia đình nông-lâm-ngư-diêm nghiệp',
  'GD': 'Hộ gia đình'
};

/**
 * Mapping mức hưởng sang tỷ lệ thanh toán
 */
const BENEFIT_LEVELS = {
  '1': '100% (không giới hạn)',
  '2': '100% (có giới hạn)',
  '3': '95%',
  '4': '80%',
  '5': '100% (kể cả ngoài phạm vi)'
};

/**
 * Component input mã số BHYT với validation
 */
const BHYTInput = ({ 
  value = '', 
  onChange, 
  error: externalError,
  required = false,
  disabled = false,
  label = "Mã số BHYT",
  placeholder = "XX 0 00 0000000000",
  ...props 
}) => {
  const [rawValue, setRawValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [validation, setValidation] = useState({
    isValid: false,
    errors: [],
    info: null
  });

  useEffect(() => {
    if (value) {
      const cleaned = value.replace(/\s+/g, '').toUpperCase();
      setRawValue(cleaned);
      formatAndValidate(cleaned);
    }
  }, [value]);

  /**
   * Format mã BHYT: XX Y ZZ NNNNNNNNNN
   */
  const formatBHYT = (input) => {
    const cleaned = input.replace(/\s+/g, '').toUpperCase();
    
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 3) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3)}`;
    
    // Full format: XX Y ZZ NNNNNNNNNN
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 15)}`;
  };

  /**
   * Validate mã BHYT
   */
  const validateBHYT = (input) => {
    const errors = [];
    let info = null;

    // Kiểm tra độ dài
    if (input.length === 0) {
      if (required) {
        errors.push('Vui lòng nhập mã số BHYT');
      }
      return { isValid: !required, errors, info };
    }

    if (input.length !== 15) {
      errors.push(`Mã số BHYT phải có 15 ký tự (hiện tại: ${input.length})`);
    }

    // Kiểm tra 2 ký tự đầu (mã đối tượng)
    const objectCode = input.slice(0, 2);
    if (!/^[A-Z]{2}$/.test(objectCode)) {
      errors.push('2 ký tự đầu phải là chữ cái (A-Z)');
    } else if (!VALID_BHYT_CODES.includes(objectCode)) {
      errors.push(`Mã đối tượng "${objectCode}" không hợp lệ`);
    } else {
      info = {
        objectCode,
        objectName: BHYT_CODE_NAMES[objectCode] || 'Không xác định'
      };
    }

    // Kiểm tra ký tự thứ 3 (mức hưởng)
    const benefitLevel = input.charAt(2);
    if (!/^[1-5]$/.test(benefitLevel)) {
      errors.push('Ký tự thứ 3 phải là số từ 1-5 (mức hưởng)');
    } else if (info) {
      info.benefitLevel = benefitLevel;
      info.benefitText = BENEFIT_LEVELS[benefitLevel] || 'Không xác định';
    }

    // Kiểm tra 2 ký tự tiếp theo (mã tỉnh)
    const provinceCode = input.slice(3, 5);
    if (!/^\d{2}$/.test(provinceCode)) {
      errors.push('Ký tự 4-5 phải là số (mã tỉnh/TP)');
    } else {
      const provinceNum = parseInt(provinceCode);
      if (provinceNum < 1 || provinceNum > 99) {
        errors.push('Mã tỉnh/TP phải từ 01-99');
      } else if (info) {
        info.provinceCode = provinceCode;
      }
    }

    // Kiểm tra 10 ký tự cuối (mã BHXH)
    const bhxhCode = input.slice(5, 15);
    if (input.length >= 5) {
      if (!/^\d{0,10}$/.test(bhxhCode)) {
        errors.push('10 ký tự cuối phải là số (mã BHXH)');
      } else if (bhxhCode.length < 10 && input.length === 15) {
        errors.push('Mã BHXH phải có 10 ký tự số');
      } else if (info && bhxhCode.length === 10) {
        info.bhxhCode = bhxhCode;
      }
    }

    return {
      isValid: errors.length === 0 && input.length === 15,
      errors,
      info
    };
  };

  /**
   * Format và validate
   */
  const formatAndValidate = (input) => {
    const formatted = formatBHYT(input);
    const validation = validateBHYT(input);
    
    setFormattedValue(formatted);
    setValidation(validation);
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    let input = e.target.value.toUpperCase();
    
    // Chỉ cho phép chữ cái (2 ký tự đầu) và số (13 ký tự sau)
    input = input.replace(/\s+/g, ''); // Remove spaces
    
    // Validate từng phần
    let cleaned = '';
    for (let i = 0; i < Math.min(input.length, 15); i++) {
      const char = input[i];
      if (i < 2) {
        // 2 ký tự đầu: chỉ chữ cái
        if (/[A-Z]/.test(char)) cleaned += char;
      } else {
        // 13 ký tự sau: chỉ số
        if (/[0-9]/.test(char)) cleaned += char;
      }
    }

    setRawValue(cleaned);
    formatAndValidate(cleaned);

    // Callback với giá trị raw
    if (onChange) {
      onChange(cleaned);
    }
  };

  /**
   * Get error message
   */
  const getErrorMessage = () => {
    if (externalError) return externalError;
    if (validation.errors.length > 0) return validation.errors[0];
    return '';
  };

  /**
   * Get validation status
   */
  const isValid = !externalError && validation.isValid;
  const isInvalid = (externalError || (validation.errors.length > 0 && rawValue.length > 0)) ? true : false;

  return (
    <div className="space-y-2">
      <Input
        label={label}
        placeholder={placeholder}
        value={formattedValue}
        onChange={handleChange}
        isRequired={required}
        isDisabled={disabled}
        isInvalid={isInvalid}
        errorMessage={getErrorMessage()}
        variant="bordered"
        labelPlacement="outside"
        startContent={<Shield className="text-default-400" size={20} />}
        endContent={
          rawValue.length > 0 && (
            isValid ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : (
              <XCircle className="text-red-500" size={20} />
            )
          )
        }
        classNames={{
          input: "font-mono tracking-wider text-base",
          inputWrapper: "border-default-200 hover:border-primary focus-within:!border-primary",
          errorMessage: "text-xs"
        }}
        {...props}
      />

      {/* Hiển thị thông tin BHYT khi hợp lệ */}
      {validation.isValid && validation.info && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg text-sm space-y-2 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-500" size={16} />
            <span className="font-semibold text-blue-700">Thông tin BHYT hợp lệ</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600 min-w-[80px]">Đối tượng:</span>
              <span className="text-blue-900 font-medium">
                {validation.info.objectCode} - {validation.info.objectName}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600 min-w-[80px]">Mức hưởng:</span>
              <span className="text-blue-900 font-medium">
                {validation.info.benefitLevel} - {validation.info.benefitText}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600 min-w-[80px]">Mã tỉnh/TP:</span>
              <span className="text-blue-900">{validation.info.provinceCode}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600 min-w-[80px]">Mã BHXH:</span>
              <span className="text-blue-900 font-mono">{validation.info.bhxhCode}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị format hint */}
      {!validation.isValid && rawValue.length === 0 && (
        <p className="text-xs text-gray-500">
          Format: <span className="font-mono">XX Y ZZ NNNNNNNNNN</span>
          <br />
          <span className="text-gray-400">
            XX: Mã đối tượng (2 chữ) • Y: Mức hưởng (1-5) • ZZ: Mã tỉnh (01-99) • N: Mã BHXH (10 số)
          </span>
        </p>
      )}
    </div>
  );
};

export default BHYTInput;

