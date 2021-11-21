# NoSQL documentation

### MongoDB

This API employs a MongoDB database for data storage.

"MongoDB is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas." -[wikipedia](https://en.wikipedia.org/wiki/MongoDB)

Main reasons for this choice of DB are scalability, security, flexibility and ease of use.

### Mongoose

This API uses Mongoose for object modelling and querying.

"Mongoose provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, query building, business logic hooks and more, out of the box." -[mongoose website](https://mongoosejs.com/)

# Collections and their indexes:

### User Schema

| Field | Data Type |
| --- | --- |
| _id | ObjectId |
| username | String |
| password | String |
| email | String |
| scope | String |
| token | String |
| lastUpdated | String |


### Berlin Places Schema

| Field | Data Type | Index |
| --- | --- | --- |
| _id | ObjectId |  |
| name | String | 1 |
| googlePlaceId | String |  |
| content | Array |  |
| category | Array | 1 |
| link | Array |  |
| tally | Int32 |  |
| bay_rating | Double |  |
