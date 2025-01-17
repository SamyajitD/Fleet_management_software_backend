const formatToIST = (utcDate) => {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    };

    return new Intl.DateTimeFormat('en-US', options).format(new Date(utcDate));
};

module.exports= formatToIST;