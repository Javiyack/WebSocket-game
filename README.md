# WebSocket Game
- Open terminal, bash or any 
## ECO server
- Go to node-server-eco folder
- Install ws
```
npm i ws
```
- Launch the server
```
npm run start 
```
## App server 
- Go to p5js-chasing-ball-sync folder
- Install http-server
```
npm install --save-dev http-server
```
- Add this to your package.json
```
"scripts": {
        "start": "http-server ."
    }
```

- Launch the App Server
```
npm start
```
Now you have a runing http-server runing at http://localhost:8080.
You can conect as client to it from any web browser.
The app uses a web socker server runing at http://localhost:5000 to 
eco the messages to the connected clients.

You can set the server to public so it can be accesed all over the inernet

