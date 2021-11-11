const { MongoClient } = require('mongodb');
require('dotenv').config();
const url = process.env.CONNECTION_STRING;

module.exports = async (query, sorting) => {
    // connect to your cluster
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // specify the DB's name
    const db = client.db('CityTravel');
    // execute find query
    const items = await db.collection('berlinPlaces').find(query).sort(sorting).toArray();
    // close connection
    client.close();
    return items;
}

