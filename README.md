# BSPlayer

Yet another frame based web player created by BS

## Introduction

Before starting, make sure to have latest version of Node.js.

To run application server:
```
npm start
```

Application will be served on `http://127.0.0.1:3000`

## How it works?

BSPlayer basically reads content of a local static image folder and show them out of an `<img>` tag in HTML by changing position of the related image.

## About Application Server

Application server is implemented on Node.js and has no dependency in it. It's just a simple Node.js application which is literally reading whole content of the application folder and serve them via HTTP protocol.

## Are there any improvements I could make to my submission?

Like every software, definitely yes. There are some anti-patterns provided in this code just beacuse lack of development time and they might make the application a little bit buggy but I think this is the best way how to implement this app with that limited time.

Here is the full list of malfunctions & anti-patterns of this app:

- Seeking may not working properly sometimes with reason of false indexing. If you seek the video to somewhere, you might see the video is starting to play from different frame which is not that frame you want to see. I think it's not impossible to fix it but it requires major changes on code.

- Indexing is set on a tripple loop which has O(n^3) complexity. 