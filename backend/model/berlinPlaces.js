const { model, Schema } = require('mongoose');

const berlinPlacesSchema = new Schema({
    name: String,
    googlePlaceId: String,
    content: Array,
    category: Array,
    link: Array,
    tally: Number,
    bay_rating: Number,
    dummy: Boolean
});

berlinPlacesSchema.index({ name: 1});
berlinPlacesSchema.index({ category: 1});

module.exports = model('berlinPlaces', berlinPlacesSchema, 'berlinPlaces');
