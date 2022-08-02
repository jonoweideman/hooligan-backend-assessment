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

    fetchSession(params)
        .then(item => {
            console.log(item);
            if (item.Item && item.Item.active_sessions.N < 3) {
                res.status(200).json({
                    message: "Found user and can increase session count."
                });
            } else if (item.Item && item.Item.active_sessions.N == 3) {
                res.status(200).json({
                    message: "Max sessions reached."
                });
            } else {
                //user does not exist
                res.status(200).json({
                    message: "User does not exist and must be created."
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: err
            });
        })
        .finally(obj => {
            res.send();
        })
});

function updateSession(item) {
    console.log("Going to update here...")
}

const fetchSession = async (params) => {
    return ddb.getItem(params).promise();
}



app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

