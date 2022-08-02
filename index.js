const express = require('express');
const PORT = process.env.PORT || 8080;
const app = express();
const router = express.Router();
const TABLE_NAME = process.env.DYNAMO_TABLE_NAME

var AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION });

var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

app.use(express.json());

app.post('/add-session', (req, res) => {
    const user_id = req.query.user_id
    var params = {
        TableName: TABLE_NAME,
        Key: {
            'user_id': {
                N: user_id
            }
        },
    };

    fetchSession(params)
        .then(item => {
            const active_sessions = item.Item ? parseInt(item.Item.active_sessions.N) : 0
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
                increaseSession(user_id, active_sessions).then(() => {
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
            res.status(500).json({
                message: err
            }).send();
        })
});

app.post('/remove-session', (req, res) => {
    const user_id = req.query.user_id
    var params = {
        TableName: TABLE_NAME,
        Key: {
            'user_id': {
                N: user_id
            }
        },
    };

    fetchSession(params)
        .then(item => {
            const active_sessions = item.Item ? parseInt(item.Item.active_sessions.N) : 0
            if (item.Item && active_sessions > 0) {
                decreaseSession(user_id, active_sessions).then(() => {
                    res.status(200).json({
                        message: `Number of active session decremented to ${active_sessions - 1}`
                    }).send();
                }).catch(err => {
                    res.status(500).json({
                        message: err
                    }).send();
                })
            } else if (item.Item && active_sessions == 0) {
                res.status(409).json({
                    message: "Already 0 active sessions, so can't remove any!"
                }).send();
            } else {
                res.status(200).json({
                    message: `Cannot decrement number of sessions for user which never existed!`
                }).send();
            }
        })
        .catch(err => {
            res.status(500).json({
                message: err
            }).send();
        })
});


const fetchSession = async (params) => {
    return ddb.getItem(params).promise();
}

const increaseSession = async (user_id, active_sessions) => {
    var params = {
        TableName: TABLE_NAME,
        Item: {
            'user_id': { N: user_id },
            'active_sessions': { N: (active_sessions + 1).toString() }
        }
    };
    return ddb.putItem(params).promise();
}

const decreaseSession = async (user_id, active_sessions) => {
    var params = {
        TableName: TABLE_NAME,
        Item: {
            'user_id': { N: user_id },
            'active_sessions': { N: (active_sessions - 1).toString() }
        }
    };
    return ddb.putItem(params).promise();
}

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

