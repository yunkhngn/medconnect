/**
 * Utility functions for appointment-related operations
 */

/**
 * Parse appointment reason field (supports both JSON and plain text)
 * @param {string|object} reason - The reason field from appointment
 * @returns {object} - Object with reasonText and attachments array
 */
export function parseReason(reason) {
  // Handle null/undefined
  if (reason == null) {
    return { reasonText: '', attachments: [] };
  }

  try {
    // If reason is already an object (backend might return object directly)
    if (typeof reason === 'object' && reason !== null) {
      let reasonText = "";
      const reasonValue = reason.reason ?? reason.text;
      // Only extract if it's a valid string/number (not null, not object)
      if (reasonValue != null && reasonValue !== 'null' && typeof reasonValue !== 'object') {
        reasonText = String(reasonValue).trim();
      }
      const attachments = Array.isArray(reason.attachments) ? reason.attachments : [];
      return { reasonText, attachments };
    }

    // If reason is a string
    if (typeof reason === 'string') {
      const trimmed = reason.trim();
      // Early return for empty strings
      if (!trimmed) {
        return { reasonText: '', attachments: [] };
      }
      
      // If it looks like JSON, try to parse
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          let reasonText = "";
          const reasonValue = parsed?.reason ?? parsed?.text;
          
          // Handle nested JSON strings (double-encoded)
          if (typeof reasonValue === 'string' && reasonValue.trim().startsWith('{')) {
            try {
              const nestedParsed = JSON.parse(reasonValue);
              const nestedReasonValue = nestedParsed?.reason ?? nestedParsed?.text;
              if (nestedReasonValue != null && nestedReasonValue !== 'null' && typeof nestedReasonValue !== 'object') {
                reasonText = String(nestedReasonValue).trim();
              }
            } catch {
              // If nested parsing fails, try regex extraction
              const match = reasonValue.match(/"reason"\s*:\s*"([^"]+)"/);
              if (match) {
                reasonText = match[1].trim();
              }
            }
          } else if (reasonValue != null && reasonValue !== 'null' && typeof reasonValue !== 'object') {
            reasonText = String(reasonValue).trim();
          }
          
          const attachments = Array.isArray(parsed?.attachments) ? parsed.attachments : [];
          return { reasonText, attachments };
        } catch {
          // If JSON parsing fails, try regex extraction as fallback
          const match = trimmed.match(/"reason"\s*:\s*"([^"]+)"/);
          if (match) {
            return { reasonText: match[1].trim(), attachments: [] };
          }
          // If regex also fails, treat as plain text
          return { reasonText: trimmed, attachments: [] };
        }
      }
      // If it's not JSON, treat as plain text
      return { reasonText: trimmed, attachments: [] };
    }
    
    // Fallback: convert to string
    return { 
      reasonText: String(reason), 
      attachments: [] 
    };
  } catch (error) {
    // If anything fails, return empty
    return { 
      reasonText: '', 
      attachments: [] 
    };
  }
}

/**
 * Format appointment reason for display
 * @param {string|object} reason - The reason field from appointment
 * @param {boolean} includeLabel - Whether to include "Lý do khám:" label (default: false)
 * @returns {string} - Formatted reason text with attachment info
 */
export function formatReasonForDisplay(reason, includeLabel = false) {
  // Handle null/undefined
  if (reason == null) {
    return includeLabel ? 'Lý do khám:\n\nKhông rõ' : 'Không rõ';
  }
  
  // If reason is already a readable string (not JSON), return it directly
  if (typeof reason === 'string' && !reason.trim().startsWith('{') && !reason.trim().startsWith('[')) {
    const trimmed = reason.trim();
    if (trimmed) {
      const displayText = trimmed;
      return includeLabel ? `Lý do khám:\n\n${displayText}` : displayText;
    }
  }
  
  const parsed = parseReason(reason);
  const { reasonText, attachments } = parsed;
  
  // If no reason text, return fallback
  if (!reasonText || !reasonText.trim()) {
    return includeLabel ? 'Lý do khám:\n\nKhông rõ' : 'Không rõ';
  }
  
  // Build the display text
  let displayText = reasonText.trim();
  
  // Ensure displayText is not a JSON string (safety check)
  if (displayText.startsWith('{') && displayText.endsWith('}')) {
    // Try to parse it one more time
    try {
      const reParsed = JSON.parse(displayText);
      const reasonValue = reParsed?.reason ?? reParsed?.text;
      if (reasonValue && typeof reasonValue === 'string') {
        displayText = reasonValue.trim();
      }
    } catch {
      // If parsing fails, try regex extraction
      const match = displayText.match(/"reason"\s*:\s*"([^"]+)"/);
      if (match) {
        displayText = match[1];
      } else {
        // Last resort: use a generic message
        displayText = 'Không rõ';
      }
    }
  }
  
  // Add label if requested
  if (includeLabel) {
    return `Lý do khám:\n\n${displayText}`;
  }
  
  return displayText;
}

/**
 * Slot to time mapping
 */
const SLOT_TIMES = {
  SLOT_1: "07:30 - 08:00",
  SLOT_2: "08:15 - 08:45",
  SLOT_3: "09:00 - 09:30",
  SLOT_4: "09:45 - 10:15",
  SLOT_5: "10:30 - 11:00",
  SLOT_6: "11:15 - 11:45",
  SLOT_7: "13:00 - 13:30",
  SLOT_8: "13:45 - 14:15",
  SLOT_9: "14:30 - 15:00",
  SLOT_10: "15:15 - 15:45",
  SLOT_11: "16:00 - 16:30",
  SLOT_12: "16:45 - 17:15"
};

/**
 * Convert slot code to time range
 * @param {string} slot - Slot code (e.g., "SLOT_1", "SLOT_2")
 * @returns {string} - Time range (e.g., "07:30 - 08:00") or original slot if not found
 */
export function formatSlotTime(slot) {
  if (!slot) return '';
  return SLOT_TIMES[slot] || slot;
}

/**
 * Get all slot options for dropdowns
 * @returns {Array} - Array of {value, label} objects
 */
export function getSlotOptions() {
  return [
    { value: 'SLOT_1', label: '07:30 - 08:00' },
    { value: 'SLOT_2', label: '08:15 - 08:45' },
    { value: 'SLOT_3', label: '09:00 - 09:30' },
    { value: 'SLOT_4', label: '09:45 - 10:15' },
    { value: 'SLOT_5', label: '10:30 - 11:00' },
    { value: 'SLOT_6', label: '11:15 - 11:45' },
    { value: 'SLOT_7', label: '13:00 - 13:30' },
    { value: 'SLOT_8', label: '13:45 - 14:15' },
    { value: 'SLOT_9', label: '14:30 - 15:00' },
    { value: 'SLOT_10', label: '15:15 - 15:45' },
    { value: 'SLOT_11', label: '16:00 - 16:30' },
    { value: 'SLOT_12', label: '16:45 - 17:15' },
  ];
}
