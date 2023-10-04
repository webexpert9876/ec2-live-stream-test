const mongoose = require('mongoose');

const databaseConnect = ()=>{
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then((data)=>{
        console.log(`Connected to database successfully ${data.connection.host}`);
    })
};

module.exports = databaseConnect;