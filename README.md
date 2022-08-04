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

If you wish to user the Dynamo table deployed in my account (while running the app locally) then let me know and I can generate some credentials for you (which are needed when running locally)! jonoweideman1@gmail.com

## API endpoints:

### POST:
    http://127.0.0.1:<port-to-serve-from>/add-session?user_id=<user-id> - to increment the number of active sessions.

    http://127.0.0.1:<port-to-serve-from>/remove-session?user_id=<user-id> - to decrement the number of active sessions.


### Responses:
    200 OK - successfully incremented or decremented the number of active sessions.
    409 CONFLICT - either max sessions (3) reached and attempting to increment or minimum sessions (0) reached and attempting to decrement.
    500 Internal Server Error

    Response message will containg information about the operation performed.

## Deployed Version and Scalability Discussion:

I have deployed the service to ECS and there are currently two containers running. Both are pointing to the same DynamoDB table.

You can ping the deployed version through the following endpoints:

```
Base URL: https://8ez7huo9af.execute-api.af-south-1.amazonaws.com/PROD/
```

Container 1:
```
- add-session-1?<user-id>
- remove-session-1?<user-id>
```
Container 2:
```
- add-session-2?<user-id>
- remove-session-2?<user-id>
```

The reason why I have separate URLs for each, is that I ended up spending too much time trying to get autoscaling to work with a load balancer (was going on to > 5 hours of work). I hope this is acceptable. This solution could be scalable by manually adding more containers, and performing load balancing at the DNS level. However, in production this would not be tolerable and I would perservere and figure out how to integrate auto-scaling into the solution. I deployed on two containers to show there are separate services with a common database.

So in summary, to make the solution scalable, I would:

1. Create an autoscaling group behind a load balancer which would track some target metric on each container to trigger scale out events.
2. Enable DAX on Dynamo DB.

Other notes which we can discuss in the next review interview:

- The service should probably delete entries when the number of active sessions reaches 0. Alternatively, a job could run at an appropriate time to clean up old entries with active sessions == 0. Could tell if they were old by adding timestamps.
- Some kind of blocking should be done on entries to ensure two containers don't increment the number of active sessions at the same time. Right now, it technically could be possible to have number of active sessions > 3, but extremely unlikely!