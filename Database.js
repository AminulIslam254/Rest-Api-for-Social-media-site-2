const mongoose = require('mongoose');

exports.connectMongoose = () => {
    mongoose
        .connect("mongodb://localhost:27017/Lashme_Innovations_Assignment1")
                .then((e) => console.log(`Database connected at ${e.connection.host}`))
                .catch((e) => console.log(e));
};

const userschema = new mongoose.Schema({
    email: String,
    password: String,
    no_of_followers: Array,
    no_of_followings: Array,
    username: String,
    token:String,

});

exports.User = mongoose.model("user_datas", userschema);