/**
 * Phone and WhatsApp utility functions for Gujarat Khedut Portal
 */

// Clean and standardize Indian mobile numbers
export const getCleanPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\D/g, '');
    
    // Strip leading 0091 if present
    if (cleaned.startsWith('0091')) {
        cleaned = cleaned.substring(2);
    }
    // Strip leading 0 if 11 digits (e.g. 09876543210)
    else if (cleaned.length === 11 && cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    // If standard 10 digit Indian number, prepend 91
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    return cleaned;
};

// Formatted display number (e.g., +91 98765 43210)
export const getFormattedPhoneNumber = (phone) => {
    const clean = getCleanPhoneNumber(phone);
    if (!clean) return phone || '';
    if (clean.length === 12 && clean.startsWith('91')) {
        return `+91 ${clean.substring(2, 7)} ${clean.substring(7)}`;
    }
    return `+${clean}`;
};

// Generates universal WhatsApp URL that immediately renders the chat with the number
export const getWhatsAppUrl = (phone, message = '') => {
    const clean = getCleanPhoneNumber(phone);
    if (!clean) return '#';
    const encoded = message ? encodeURIComponent(message) : '';
    // api.whatsapp.com/send directly opens WhatsApp on mobile and WhatsApp Web on Desktop
    return `https://api.whatsapp.com/send?phone=${clean}${encoded ? `&text=${encoded}` : ''}`;
};

// Generates direct phone call link
export const getTelUrl = (phone) => {
    const clean = getCleanPhoneNumber(phone);
    if (!clean) return '#';
    return `tel:+${clean}`;
};

// Handles clicking Call button on both Mobile (dialer) and Desktop (clipboard + dialer)
export const handleCallClick = (e, phone, name = '') => {
    const clean = getCleanPhoneNumber(phone);
    if (!clean) {
        e?.preventDefault();
        alert('Phone number is not available.');
        return;
    }

    // Try copying to clipboard on desktop so user can paste or dial if desktop has no dialer app
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(`+${clean}`).catch(() => {});
    }
};

// Handles clicking WhatsApp button
export const handleWhatsAppClick = (e, phone, message = '') => {
    const clean = getCleanPhoneNumber(phone);
    if (!clean) {
        e?.preventDefault();
        alert('Mobile number is not available for WhatsApp.');
        return;
    }
    const url = getWhatsAppUrl(phone, message);
    if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};
