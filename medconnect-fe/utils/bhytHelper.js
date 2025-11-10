/**
 * BHYT Helper Utilities
 * Các hàm tiện ích để xử lý mã số Bảo hiểm Y tế Việt Nam
 */

/**
 * Danh sách mã đối tượng BHYT hợp lệ
 */
export const VALID_BHYT_CODES = [
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
export const BHYT_CODE_NAMES = {
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
export const BENEFIT_LEVELS = {
  '1': {
    rate: '100%',
    description: 'Thanh toán 100% không giới hạn tỷ lệ',
    note: 'Áp dụng cho CC, TE'
  },
  '2': {
    rate: '100%',
    description: 'Thanh toán 100% có giới hạn tỷ lệ',
    note: 'Áp dụng cho CK, CB, KC, HN, DT, DK, XD, BT, TS'
  },
  '3': {
    rate: '95%',
    description: 'Thanh toán 95% chi phí KCB',
    note: 'Áp dụng cho HT, TC, CN'
  },
  '4': {
    rate: '80%',
    description: 'Thanh toán 80% chi phí KCB',
    note: 'Áp dụng cho DN, HX, CH, NN, TK, HC, XK, TB, NO, CT, XB, TN, CS, XN, MS, HD, TQ, TA, TY, HG, LS, PV, HS, SV, GB, GD'
  },
  '5': {
    rate: '100%',
    description: 'Thanh toán 100% kể cả ngoài phạm vi',
    note: 'Áp dụng cho QN, CA, CY'
  }
};

/**
 * Danh sách tỉnh/thành phố (mã 01-99)
 */
export const PROVINCE_CODES = {
  '01': 'Hà Nội',
  '02': 'Hà Giang',
  '04': 'Cao Bằng',
  '06': 'Bắc Kạn',
  '08': 'Tuyên Quang',
  '10': 'Lào Cai',
  '11': 'Điện Biên',
  '12': 'Lai Châu',
  '14': 'Sơn La',
  '15': 'Yên Bái',
  '17': 'Hòa Bình',
  '19': 'Thái Nguyên',
  '20': 'Lạng Sơn',
  '22': 'Quảng Ninh',
  '24': 'Bắc Giang',
  '25': 'Phú Thọ',
  '26': 'Vĩnh Phúc',
  '27': 'Bắc Ninh',
  '30': 'Hải Dương',
  '31': 'Hải Phòng',
  '33': 'Hưng Yên',
  '34': 'Thái Bình',
  '35': 'Hà Nam',
  '36': 'Nam Định',
  '37': 'Ninh Bình',
  '38': 'Thanh Hóa',
  '40': 'Nghệ An',
  '42': 'Hà Tĩnh',
  '44': 'Quảng Bình',
  '45': 'Quảng Trị',
  '46': 'Thừa Thiên Huế',
  '48': 'Đà Nẵng',
  '49': 'Quảng Nam',
  '51': 'Quảng Ngãi',
  '52': 'Bình Định',
  '54': 'Phú Yên',
  '56': 'Khánh Hòa',
  '58': 'Ninh Thuận',
  '60': 'Bình Thuận',
  '62': 'Kon Tum',
  '64': 'Gia Lai',
  '66': 'Đắk Lắk',
  '67': 'Đắk Nông',
  '68': 'Lâm Đồng',
  '70': 'Bình Phước',
  '72': 'Tây Ninh',
  '74': 'Bình Dương',
  '75': 'Đồng Nai',
  '77': 'Bà Rịa - Vũng Tàu',
  '79': 'TP Hồ Chí Minh',
  '80': 'Long An',
  '82': 'Tiền Giang',
  '83': 'Bến Tre',
  '84': 'Trà Vinh',
  '86': 'Vĩnh Long',
  '87': 'Đồng Tháp',
  '89': 'An Giang',
  '91': 'Kiên Giang',
  '92': 'Cần Thơ',
  '93': 'Hậu Giang',
  '94': 'Sóc Trăng',
  '95': 'Bạc Liêu',
  '96': 'Cà Mau'
};

/**
 * Format mã BHYT: XX Y ZZ NNNNNNNNNN
 * @param {string} input - Mã BHYT chưa format
 * @returns {string} Mã BHYT đã format
 */
export const formatBHYT = (input) => {
  if (!input) return '';
  
  const cleaned = input.replace(/\s+/g, '').toUpperCase();
  
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 3) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3)}`;
  
  // Full format: XX Y ZZ NNNNNNNNNN
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 15)}`;
};

/**
 * Parse thông tin từ mã BHYT
 * @param {string} bhytCode - Mã BHYT (15 ký tự)
 * @returns {object|null} Thông tin BHYT hoặc null nếu không hợp lệ
 */
export const parseBHYT = (bhytCode) => {
  if (!bhytCode || bhytCode.length !== 15) return null;

  const cleaned = bhytCode.replace(/\s+/g, '').toUpperCase();
  
  const objectCode = cleaned.slice(0, 2);
  const benefitLevel = cleaned.slice(2, 3);
  const provinceCode = cleaned.slice(3, 5);
  const bhxhCode = cleaned.slice(5, 15);

  // Validate
  if (!VALID_BHYT_CODES.includes(objectCode)) return null;
  if (!/^[1-5]$/.test(benefitLevel)) return null;
  if (!/^\d{2}$/.test(provinceCode)) return null;
  if (!/^\d{10}$/.test(bhxhCode)) return null;

  return {
    raw: cleaned,
    formatted: formatBHYT(cleaned),
    objectCode,
    objectName: BHYT_CODE_NAMES[objectCode] || 'Không xác định',
    benefitLevel,
    benefitRate: BENEFIT_LEVELS[benefitLevel]?.rate || 'Không xác định',
    benefitDescription: BENEFIT_LEVELS[benefitLevel]?.description || '',
    provinceCode,
    provinceName: PROVINCE_CODES[provinceCode] || `Tỉnh ${provinceCode}`,
    bhxhCode
  };
};

/**
 * Validate mã BHYT
 * @param {string} bhytCode - Mã BHYT cần validate
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validateBHYT = (bhytCode) => {
  const errors = [];

  if (!bhytCode || bhytCode.length === 0) {
    return { isValid: false, errors: ['Vui lòng nhập mã số BHYT'] };
  }

  const cleaned = bhytCode.replace(/\s+/g, '').toUpperCase();

  if (cleaned.length !== 15) {
    errors.push(`Mã số BHYT phải có 15 ký tự (hiện tại: ${cleaned.length})`);
  }

  // Kiểm tra 2 ký tự đầu (mã đối tượng)
  const objectCode = cleaned.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(objectCode)) {
    errors.push('2 ký tự đầu phải là chữ cái (A-Z)');
  } else if (!VALID_BHYT_CODES.includes(objectCode)) {
    errors.push(`Mã đối tượng "${objectCode}" không hợp lệ`);
  }

  // Kiểm tra ký tự thứ 3 (mức hưởng)
  const benefitLevel = cleaned.charAt(2);
  if (!/^[1-5]$/.test(benefitLevel)) {
    errors.push('Ký tự thứ 3 phải là số từ 1-5 (mức hưởng)');
  }

  // Kiểm tra 2 ký tự tiếp theo (mã tỉnh)
  const provinceCode = cleaned.slice(3, 5);
  if (!/^\d{2}$/.test(provinceCode)) {
    errors.push('Ký tự 4-5 phải là số (mã tỉnh/TP)');
  } else {
    const provinceNum = parseInt(provinceCode);
    if (provinceNum < 1 || provinceNum > 99) {
      errors.push('Mã tỉnh/TP phải từ 01-99');
    }
  }

  // Kiểm tra 10 ký tự cuối (mã BHXH)
  const bhxhCode = cleaned.slice(5, 15);
  if (cleaned.length >= 5) {
    if (!/^\d{0,10}$/.test(bhxhCode)) {
      errors.push('10 ký tự cuối phải là số (mã BHXH)');
    } else if (bhxhCode.length < 10 && cleaned.length === 15) {
      errors.push('Mã BHXH phải có 10 ký tự số');
    }
  }

  return {
    isValid: errors.length === 0 && cleaned.length === 15,
    errors
  };
};

/**
 * Check xem mã BHYT có hợp lệ không
 * @param {string} bhytCode - Mã BHYT
 * @returns {boolean}
 */
export const isValidBHYT = (bhytCode) => {
  return validateBHYT(bhytCode).isValid;
};

/**
 * Mask mã BHYT (ẩn 6 số cuối của mã BHXH)
 * @param {string} bhytCode - Mã BHYT
 * @returns {string} Mã BHYT đã mask
 */
export const maskBHYT = (bhytCode) => {
  if (!bhytCode || bhytCode.length < 15) return bhytCode;
  
  const cleaned = bhytCode.replace(/\s+/g, '');
  const visible = cleaned.slice(0, 9); // XX Y ZZ NNNN
  const masked = visible + '******';
  
  return formatBHYT(masked);
};

