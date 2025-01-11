const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789', 12);

const generateUniqueId = () => {
    let id = nanoid();
    if (id[0] === '0') id = (Math.floor(Math.random() * 9) + 1) + id.slice(1);
    return id;
};

module.exports= generateUniqueId;