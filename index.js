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
            if (data.Item) {
                // Items exists.
                if (data.Item.active_sessions.N == 3) {
                    console.log('Max sessions reached')
                } else {
                    updateSession(data.Item)
                }

            } else {
                // Item did not exist. i.e. no active sessions and must create
                console.log("Didn't find that user. Will create now...")
            }
        }
    });
    res.status(200).json({
        message: `Maybe a success? Check the logs!`
    });
});

function updateSession(item) {
    console.log("Going to update here...")
}



app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

