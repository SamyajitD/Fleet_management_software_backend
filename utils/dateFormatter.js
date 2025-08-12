const formatToIST = (date) => {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };

    const dateObj = new Date(date);
    // Convert to IST by adding 5 hours and 30 minutes
    dateObj.setMinutes(dateObj.getMinutes());
    
    const formattedTime = dateObj.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    const formattedDate = dateObj.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return `${formattedTime}, ${formattedDate}`;
};

module.exports = formatToIST;