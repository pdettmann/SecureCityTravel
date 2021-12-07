require("./config/db").connect();
const randomstring = require("randomstring");
const Place = require("./model/berlinPlaces");

const rdmString = () => {
    const str = randomstring.generate();
    return str
};

const rdmNumber = () => {
    const nr = randomstring.generate({charset: 'numeric'});
    return nr
};

const randomPlace = async () => {
    try {
        const place = await Place.create({
        name: rdmString(),
        googlePlaceId: rdmString(),
        content: rdmString(),
        category: "Best Bars",
        link: rdmString(),
        tally: rdmNumber(),
        bay_rating: rdmNumber(),
        dummy: true
        })
        console.log(place);
    } catch (err) {
        console.error(err);
    }
};

randomPlace();

// for (let i = 0; i < 50000; i++) {
//     randomPlace();
// }

console.log("done");


