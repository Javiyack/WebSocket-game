# WebSocket Game
## ECO server
- Open terminal, bash or any 
- Install ws
```
npm i ws
```
- Go to node-server-eco folder
- Launch the server
```
npm run start 
```
## App server
- Install http-server
```
npm i http-server
```
- Go to p5js-chasing-ball-sync folder
- Launch the App Server
```
http-server
```
Now you have a runing http-server runing at http://localhost:8080.
You can conect as client to it from any web browser.
The app uses a web socker server runing at http://localhost:5000 to 
eco the messages to the connected clients.

You can set the server to public so it can be accesed all over the inernet

