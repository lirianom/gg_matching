# gg_matching a framework for creating web based peer-to-peer games

This framework allows developers to create a web based game without worrying about managing peer-to-peer connections and user information. 

The goal of gg_matching is to take the managing of user's and their connections out of the game developing and let the developer focus on creating a fun game. 


## Installing 

To begin with you need nodeJS and npm installed.

To ease development use nodemon to start the server https://github.com/remy/nodemon
```
  npm install nodemon
```

To setup the node.js server side you need Express and Peer
```
  npm install express
```
```
  npm install peer
```

The framework uses rethinkdb to store user information
``` 
  npm install rethinkdb
```
Follow the steps at https://rethinkdb.com/docs/install to get rethinkdb setup on your OS

The login of the framework uses Google's authentication 
```
  npm install google-auth-library
```

Finally you need to create a google developer account at https://console.developers.google.com/apis/library?project=capstone-162319&organizationId=533863865723 
Go to credentials and create credentials for a web application and copy the client-id there are two changes you have to make.
 - Replace the client-id in any html files that contain a login button. 
 - Replace the client-id in routes/handleEndpoints checkAuth function
