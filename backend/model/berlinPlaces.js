const { model, Schema } = require('mongoose');

const berlinPlacesSchema = new Schema({
    name: String,
    googlePlaceId: String,
    content: Array,
    category: Array,
    link: Array,
    tally: Number,
    bay_rating: Number
});

module.exports = model('berlinPlaces', berlinPlacesSchema, 'berlinPlaces');
