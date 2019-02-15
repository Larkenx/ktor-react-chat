# KTOR Simple Websockets Chat Server+Client
This repository hosts a simple Kotlin Ktor websockets chat server, based off the [this ktor guide](https://ktor.io/quickstart/guides/chat.html#) on the official ktor site. Under `resources/client`, you will also find a simple chat web client created with React and Material UI. 

To work with this app, simply pull this project into Intellij or Eclipse, and build with gradle. You should be able to run the main method of the `Application.kt` file under `src`, and that will start up a Netty server. Hit `http://localhost:8080/`, and the React app should get served up to you!

If you want to run the web application independently, you can do so by installing the dependencies with `yarn` or `npm` under the `resources/client` folder, then running `yarn start`.