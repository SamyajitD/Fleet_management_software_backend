const randomId = require('random-id');

const generateUniqueId = () => {
    let id = randomId(12, '0');
    if (id[0] === '0') id = (Math.floor(Math.random() * 9) + 1) + id.slice(1);
    return id;
};

module.exports= generateUniqueId;