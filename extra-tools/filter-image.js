const data = require('./anh.json')

const filteredData = data.ban_kem.map(i => i.url)

console.log(filteredData.join('\n'))