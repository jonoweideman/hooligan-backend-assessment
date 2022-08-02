# hooligan-backend-assessment

### To build Docker Image:
```
docker build -t session-tracker:1.0 .
```

### To run:
```
docker run -e REGION=af-south-1 -e DYNAMO_TABLE_NAME=active-viewers -e AWS_ACCESS_KEY_ID=<access-key> -e AWS_SECRET_ACCESS_KEY=<secret-acces-key> -p <port-to-serve-from>:8080 session-tracker:1.0
```

If using your own DynamoDB table then update REGION and DYANMO_TABLE_NAME accordingly.

## API endpoints:

### POST:
    http://127.0.0.1:5000/add-session?user_id=<user-id> - to increment the number of active sessions.

    http://127.0.0.1:5000/remove-session?user_id=<user-id> - to decrement the number of active sessions.


### Responses:
    200 OK - successfully incremented or decremented the number of active sessions.
    409 CONFLICT - either max sessions (3) reached and attempting to increment or minimum sessions (0) reached and attempting to decrement.
    500 Internal Server Error

    Response message will containg information about the operation performed.