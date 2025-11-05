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
      // If it looks like JSON, try to parse
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          let reasonText = "";
          const reasonValue = parsed?.reason ?? parsed?.text;
          if (reasonValue != null && reasonValue !== 'null' && typeof reasonValue !== 'object') {
            reasonText = String(reasonValue).trim();
          }
          const attachments = Array.isArray(parsed?.attachments) ? parsed.attachments : [];
          return { reasonText, attachments };
        } catch {
          // If JSON parsing fails, treat as plain text
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
  const parsed = parseReason(reason);
  const { reasonText, attachments } = parsed;
  
  // If no reason text, return fallback
  if (!reasonText || !reasonText.trim()) {
    return includeLabel ? 'Lý do khám:\n\nKhông rõ' : 'Không rõ';
  }
  
  // Build the display text
  let displayText = reasonText.trim();
  
  // Add attachment info if present
  if (attachments && attachments.length > 0) {
    displayText += ' (có đính kèm ảnh)';
  }
  
  // Add label if requested
  if (includeLabel) {
    return `Lý do khám:\n\n${displayText}`;
  }
  
  return displayText;
}
