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
            const active_sessions = parseInt(item.Item.active_sessions.N)
            if (item.Item && active_sessions < 3) {
                increaseSession(user_id, active_sessions).then(() => {
                    res.status(200).json({
                        message: `Number of active session incremented to ${active_sessions + 1}`
                    }).send();
                }).catch(err => {
                    res.status(500).json({
                        message: err
                    }).send();
                })
            } else if (item.Item && active_sessions == 3) {
                res.status(409).json({
                    message: "Max sessions of 3 reached."
                }).send();
            } else {
                //user does not exist
                increaseSession(user_id, 0).then(() => {
                    res.status(200).json({
                        message: `Number of active session incremented to 1`
                    }).send();
                }).catch(err => {
                    res.status(500).json({
                        message: err
                    }).send();
                })
            }
        })
        .catch(err => {
            console.log(err);
            // res.status(500).json({
            //     message: err
            // });
        })
        .finally(obj => {
        })
});

function updateSession(item) {
    console.log("Going to update here...")
}

const fetchSession = async (params) => {
    return ddb.getItem(params).promise();
}

const increaseSession = async (user_id, active_sessions) => {
    console.log(`active session: ${active_sessions}`)
    var params = {
        TableName: TABLE_NAME,
        Item: {
            'user_id': { N: user_id },
            'active_sessions': { N: (active_sessions + 1).toString() }
        }
    };
    console.log(params)
    return ddb.putItem(params).promise();
}

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

