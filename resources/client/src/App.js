import React, { Component } from 'react'
import { Grid, Card, CardActions, CardContent, CardHeader, Typography, withStyles, TextField, Divider, Button } from '@material-ui/core'
import SendIcon from '@material-ui/icons/Send'

const styles = theme => ({
    card: {
        minWidth: 600,
        maxWidth: 600
    },
    messages: {
        minHeight: 250,
        maxHeight: 250,
        overflowY: 'auto'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    myMessage: {
        borderRadius: 6,
        backgroundColor: '#0084ff',
        color: '#ffffff',
        padding: 6,
        margin: 2
    },
    notMyMessage: {
        borderRadius: 6,
        backgroundColor: '#f6f6f6',
        padding: 6,
        margin: 2
    }
})

class App extends Component {
    constructor(props) {
        super(props)

        const socket = new WebSocket('ws://localhost:8080/chat')

        this.state = {
            messages: [
                {
                    author: 'not me',
                    text: 'hello world'
                },
                {
                    author: 'me',
                    text: 'hello world'
                }
            ],
            text: '',
            author: 'me',
            socket
        }

        socket.onopen = () => {
            console.log('Succesfully connected to chat server at ws://localhost:8080/chat.')
        }

        socket.onclose = () => {
            console.log('Goodbye!')
        }

        socket.onerror = () => {
            console.log('Uh oh...')
        }

        socket.onmessage = event => {
            console.log(event)
            const data = JSON.parse(event.data)
            const { type } = data
            switch (type) {
                case 'message':
                    this.setState(state => ({
                        messages: [...state.messages, { text: data.text, author: data.author }]
                    }))
                    break
                case 'joinChat':
                    this.setState(state => ({
                        author: data.author
                    }))
                    break
                default:
                    break
            }
        }
    }

    handleChange = event => {
        this.setState({
            text: event.target.value
        })
    }

    handleSubmit = () => {
        const { socket, text, author } = this.state
        socket.send(
            JSON.stringify({
                text,
                author
            })
        )
    }

    render() {
        const { classes } = this.props
        return (
            <div className="App">
                <Grid container justify="center">
                    <Card className={classes.card}>
                        <CardHeader
                            color="primary"
                            title={
                                <Typography variant="display1" gutterBottom>
                                    Super Simple Chat
                                </Typography>
                            }
                        />
                        <Divider />
                        <CardContent>
                            <Grid className={classes.messages} container alignContent={'flex-end'}>
                                {this.state.messages.map((message, index) => {
                                    const myMessage = message.author === this.state.author
                                    return (
                                        <Grid key={index} container item xs={12} justify={myMessage ? 'flex-end' : 'flex-start'}>
                                            <Grid item style={{ flexShrink: 1 }}>
                                                <Typography
                                                    variant="body1"
                                                    className={myMessage ? classes.myMessage : classes.notMyMessage}
                                                >
                                                    {message.text}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </CardContent>
                        <Divider />
                        <Grid container wrap="nowrap">
                            <Grid item>
                                <TextField
                                    label="Type a message..."
                                    autoFocus
                                    className={classes.card}
                                    value={this.state.text}
                                    onChange={this.handleChange}
                                    InputProps={{
                                        disableUnderline: true
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <Button variant="text" onClick={() => this.handleSubmit()}>
                                    Send
                                    <SendIcon
                                        style={{
                                            paddingLeft: '6px',
                                            color: '#0084ff'
                                        }}
                                    />
                                </Button>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </div>
        )
    }
}

export default withStyles(styles)(App)
