/**
 * Utility functions for appointment-related operations
 */

/**
 * Parse appointment reason field (supports both JSON and plain text)
 * @param {string|object} reason - The reason field from appointment
 * @returns {object} - Object with reasonText and attachments array
 */
export function parseReason(reason) {
  try {
    // If reason is a string that looks like JSON
    if (typeof reason === 'string' && reason.trim().startsWith('{')) {
      const parsed = JSON.parse(reason);
      const reasonText = parsed?.reason || parsed?.text || "";
      const attachments = Array.isArray(parsed?.attachments) ? parsed.attachments : [];
      return { reasonText, attachments };
    }
    
    // If reason is already an object
    if (typeof reason === 'object' && reason !== null) {
      const reasonText = reason.reason || reason.text || "";
      const attachments = Array.isArray(reason.attachments) ? reason.attachments : [];
      return { reasonText, attachments };
    }
    
    // Fallback: treat as plain text
    return { 
      reasonText: typeof reason === 'string' ? reason : '', 
      attachments: [] 
    };
  } catch (error) {
    // If JSON parsing fails, treat as plain text
    return { 
      reasonText: typeof reason === 'string' ? reason : '', 
      attachments: [] 
    };
  }
}
