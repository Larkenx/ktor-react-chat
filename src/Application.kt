package larkenx.games

import com.google.gson.Gson
import io.ktor.application.*
import io.ktor.features.AutoHeadResponse
import io.ktor.features.CORS
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.http.*
import io.ktor.sessions.*
import io.ktor.websocket.*
import io.ktor.http.cio.websocket.*
import io.ktor.http.content.*
import kotlinx.coroutines.channels.ClosedReceiveChannelException
import java.io.File
import java.time.*
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.LinkedHashSet


abstract class Event(val type: String)
data class ChatMessage(val text: String = "", val author: String = "") : Event("message")
data class JoinChat(val previousMessages: ArrayList<ChatMessage>, val author: String) : Event("joinChat")
data class UpdateParticipants(val participants: Set<String>) : Event("participantsUpdate")
val animals = File("animals.txt").readLines()
val colors = File("colors.txt").readLines()

@Suppress("unused") // Referenced in application.conf
@kotlin.jvm.JvmOverloads
fun Application.module(testing: Boolean = false) {
    /* // Uncomment this if you are doing local development
    install(CORS) {
        header(HttpHeaders.AccessControlAllowOrigin)
        anyHost()
    }
    */

    install(io.ktor.websocket.WebSockets) {
        pingPeriod = Duration.ofSeconds(15)
        timeout = Duration.ofSeconds(15)
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    install(AutoHeadResponse)

    routing {
        val previousMessages: ArrayList<ChatMessage> = ArrayList()
        val connections = Collections.synchronizedSet(LinkedHashSet<DefaultWebSocketSession>())
        val authors = Collections.synchronizedSet(LinkedHashSet<String>())

        static("/static") {
            resources("client/build/static")
        }

        static("/") {
            resources("client/build/")
            default("client/build/index.html")
        }

        webSocket("/chat") {
            connections.add(this)
            println("A new socket has joined the chat!")
            val author = colors.random() + " " + animals.random()
            outgoing.send(Frame.Text(Gson().toJson(JoinChat(previousMessages, author))))
            authors.add(author)
            connections.forEach { socket -> socket.outgoing.send(Frame.Text(Gson().toJson(UpdateParticipants(authors))))}
            try {
                while (true) {
                    val frame = incoming.receive()
                    when (frame) {
                        is Frame.Text -> {
                            val json = frame.readText()
                            val chatMessage = Gson().fromJson(json, ChatMessage::class.java)
                            println("New Chat Message received: $json")
                            previousMessages.add(chatMessage)
                            for (socket in connections) {
                                socket.outgoing.send(Frame.Text(Gson().toJson(chatMessage)))
                            }
                        }
                    }
                }
            } catch (exception: ClosedReceiveChannelException) {
                println("A socket has left the chat!")
            } finally {
                connections.remove(this)
            }
        }
    }
}

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)
