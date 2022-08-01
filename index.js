const express = require('express');
const PORT = process.env.PORT || 8080;
const app = express();
const router = express.Router();
const TABLE_NAME = process.env.DYNAMO_TABLE_NAME

var AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION });

var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

app.use(express.json());

app.post('/', (req, res) => {

    console.log(`TableName: ${TABLE_NAME}`)

    const user_id = req.query.user_id

    var params = {
        TableName: TABLE_NAME,
        Key: {
            'user_id': {
                N: user_id
            }
        },
    };

    console.log(`User ID: ${user_id}`)

    ddb.getItem(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
    });
    res.status(200).json({
        message: `Maybe a success? Check the logs!`
    });
});



app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

