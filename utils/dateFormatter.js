const formatToIST = (date) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    
    // Format the date in IST timezone
    const options = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    return dateObj.toLocaleString('en-IN', options);
};

module.exports = formatToIST;