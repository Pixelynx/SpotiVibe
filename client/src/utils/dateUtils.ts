/**
 * Utility functions for date handling
 */

/**
 * Extracts the year from various date formats
 * @param dateString - The date string to extract the year from
 * @returns The extracted year or empty string if no year could be found
 */
export const extractYearFromDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // For formats like "July 26, 2024" - extract the year after the comma
  if (dateString.includes(',')) {
    const parts = dateString.split(',');
    if (parts.length > 1) {
      // Trim and get the last part which should contain the year
      const yearPart = parts[parts.length - 1].trim();
      return yearPart;
    }
  }
  
  // For formats like "2018-03-21" - extract the first 4 characters
  if (dateString.includes('-')) {
    return dateString.substring(0, 4);
  }
  
  // If no special format detected but it's a 4-digit number
  if (dateString.length === 4 && !isNaN(parseInt(dateString))) {
    return dateString;
  }
  
  // If all else fails, check if there's a 4-digit year anywhere in the string
  const yearMatch = dateString.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return yearMatch[0];
  }
  
  console.warn(`Could not extract year from date string: "${dateString}"`);
  return '';
}; 