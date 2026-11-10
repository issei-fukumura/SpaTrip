if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Spaground = require('../models/spaground');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/SpaTrip';

mongoose.connect(dbUrl)
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });


const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Spaground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomSpaIndex = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 2000) + 1000;
        const spa = new Spaground({
            author: '6af2de2c90f298bf2e725e82',
            location: `${cities[randomSpaIndex].prefecture}${cities[randomSpaIndex].city}`,
            title: `${sample(descriptors)}・${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[randomSpaIndex].longitude,
                    cities[randomSpaIndex].latitude
                ]
            },
            description: '木曾路はすべて山の中である。あるところは岨づたいに行く崖の道であり、あるところは数十間の深さに臨む木曾川の岸であり、あるところは山の尾をめぐる谷の入り口である。一筋の街道はこの深い森林地帯を貫いていた。東ざかいの桜沢から、西の十曲峠まで、木曾十一宿はこの街道に添うて、二十二里余にわたる長い谿谷の間に散在していた。道路の位置も幾たびか改まったもので、古道はいつのまにか深い山間に埋もれた。',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/boxcpqhv/image/upload/v1794030793/SpaTrip/ktqvh8dhkk0vtswqygm6.jpg',
                    filename: 'SpaTrip/ktqvh8dhkk0vtswqygm6',
                },
                {
                    url: 'https://res.cloudinary.com/boxcpqhv/image/upload/v1794030793/SpaTrip/j3ueiqbzrlg2nybm7lrg.jpg',
                    filename: 'SpaTrip/j3ueiqbzrlg2nybm7lrg',
                },
            ]
        });
        await spa.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});










