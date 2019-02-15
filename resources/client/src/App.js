import React, { Component } from 'react'
import {
    Grid,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Typography,
    withStyles,
    TextField,
    Divider,
    Button,
    AppBar,
    Toolbar,
    Drawer
} from '@material-ui/core'
import SendIcon from '@material-ui/icons/Send'
import './App.css'

const styles = theme => ({
    root: {
        flexGrow: 1
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    grow: {
        flexGrow: 1
    },
    drawer: {
        width: 240,
        flexShrink: 0,
        overflowY: 'auto'
    },
    drawerPaper: {
        width: 240
    },
    card: {
        minWidth: 600,
        maxWidth: 600
    },
    messages: {
        minHeight: 300,
        maxHeight: 300,
        overflow: 'auto'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    myMessage: {
        minHeight: '16px',
        minWidth: '16px',
        borderRadius: 6,
        backgroundColor: '#0084ff',
        color: '#ffffff',
        padding: 6,
        margin: 2
    },
    notMyMessage: {
        minHeight: '16px',
        minWidth: '16px',
        borderRadius: 6,
        backgroundColor: theme.palette.type === 'dark' ? 'rgba(0,0,0,0.5)' : '#f6f6f6',
        padding: 6,
        margin: 2
    },
    toolbar: theme.mixins.toolbar
})

class App extends Component {
    endOfChat = React.createRef()

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
            author: '',
            participants: [],
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
            const data = JSON.parse(event.data)
            const { type } = data
            switch (type) {
                case 'message':
                    this.setState(state => ({
                        messages: [...state.messages, { text: data.text, author: data.author }]
                    }))
                    this.scrollToBottom()
                    break
                case 'joinChat':
                    this.setState(state => ({
                        messages: data.previousMessages,
                        author: data.author
                    }))
                    this.scrollToBottom()
                    break
                case 'participantsUpdate':
                    this.setState(state => ({
                        participants: data.participants
                    }))
                    break
                default:
                    break
            }
        }
    }

    scrollToBottom = () => {
        this.endOfChat.current.scrollIntoView({ behavior: 'smooth' })
    }

    handleChange = event => {
        this.setState({
            text: event.target.value
        })
    }

    handleEnter = event => {
        if (event.key.toLowerCase() === 'enter' && this.state.text !== '') {
            this.handleSubmit()
            event.preventDefault()
        }
    }

    handleSubmit = () => {
        const { socket, text, author } = this.state
        socket.send(
            JSON.stringify({
                text,
                author
            })
        )
        this.setState({
            text: ''
        })
    }

    renderMessages() {
        const { classes } = this.props
        return (
            <Grid container alignContent={'flex-end'}>
                {this.state.messages.map((message, index) => {
                    const myMessage = message.author === this.state.author
                    const prevMessage = index === 0 || this.state.messages.length < index + 1 ? null : this.state.messages[index - 1]
                    const showAuthor = prevMessage === null || (prevMessage !== null && prevMessage.author !== message.author)
                    return (
                        <Grid key={index} container item xs={12} justify={myMessage ? 'flex-end' : 'flex-start'} style={{ padding: 3 }}>
                            {showAuthor && (
                                <Grid item xs={12}>
                                    <Typography align={myMessage ? 'right' : 'left'} variant="caption" style={{ fontWeight: 'bold' }}>
                                        {message.author}
                                    </Typography>
                                </Grid>
                            )}
                            <Grid item style={{ flexShrink: 1 }}>
                                <Typography variant="body1" className={myMessage ? classes.myMessage : classes.notMyMessage}>
                                    {message.text}
                                </Typography>
                            </Grid>
                        </Grid>
                    )
                })}
                <div ref={this.endOfChat} />
            </Grid>
        )
    }

    renderParticpants() {
        const { classes } = this.props
        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography align="center" variant="h6">
                        Users
                    </Typography>
                    <Typography align="center" variant="subtitle2">
                        {this.state.participants.length} total
                    </Typography>
                    <Divider />
                </Grid>
                {this.state.participants.map((user, index) => {
                    return (
                        <Grid key={index} item xs={12}>
                            <Typography align="center" variant="caption" style={{ fontWeight: 'bold' }}>
                                {user}
                            </Typography>
                        </Grid>
                    )
                })}
            </Grid>
        )
    }

    render() {
        const { classes } = this.props
        return (
            <div className={classes.root}>
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <Typography color="inherit" className={classes.grow} variant="h6">
                            Simple Chat
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" className={classes.drawer} classes={{ paper: classes.drawerPaper }}>
                    <div className={classes.toolbar} />
                    {this.renderParticpants()}
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Grid container justify="center">
                        <Card className={classes.card} style={{ padding: 16, margin: 16 }}>
                            <CardContent className={classes.messages}>{this.renderMessages()}</CardContent>
                            <Divider />
                            <Grid container wrap="nowrap" justify="center" style={{ marginTop: 12 }}>
                                <Grid item xs={10} container justifty="center">
                                    <TextField
                                        label="Type a message..."
                                        autoFocus
                                        className={classes.card}
                                        value={this.state.text}
                                        onChange={this.handleChange}
                                        onKeyDown={this.handleEnter}
                                        InputProps={{
                                            disableUnderline: true
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} container justify="center">
                                    <Button variant="text" disabled={this.state.text === ''} onClick={() => this.handleSubmit()}>
                                        Send
                                        <SendIcon
                                            style={{
                                                paddingLeft: '6px',
                                                color: this.state.text === '' ? 'rgba(0,0,0,.2)' : '#0084ff'
                                            }}
                                        />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>
                </main>
            </div>
        )
    }
}

export default withStyles(styles)(App)
