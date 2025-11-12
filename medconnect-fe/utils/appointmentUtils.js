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
