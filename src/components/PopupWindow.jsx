import Popup from 'reactjs-popup';
import '../App.css'
import { IconButton, Button, TextField } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PhoneIcon from '@mui/icons-material/Phone'
import React, { useEffect, useRef, useState, useContext } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const socket = io.connect('http://nodevideo-env.eba-tdwxcs8q.ap-southeast-1.elasticbeanstalk.com/')
// const socket = io.connect('http://localhost:5000/')

export default function PopupWindow() {
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);

    const [me, setMe] = useState("")
    const [stream, setStream] = useState()
    const [receivingCall, setReceivingCall] = useState(false)
    const [caller, setCaller] = useState("")
    const [callerSignal, setCallerSignal] = useState()
    const [callAccepted, setCallAccepted] = useState(false)
    const [idToCall, setIdToCall] = useState("")
    const [callEnded, setCallEnded] = useState(false)
    const [name, setName] = useState("")
    const myVideo = useRef()
    const userVideo = useRef()
    const connectionRef = useRef()

    
    const { dataChat } = useContext(ChatContext);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream)
            myVideo.current.srcObject = stream
        })

        socket.on("me", (id) => {
            setMe(currentUser.uid)
        })

        socket.on("callUser", (data) => {
            setReceivingCall(true)
            setCaller(data.from)
            setName(data.name)
            setCallerSignal(data.signal)
        })
    }, [])

    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        })
        peer.on("signal", (data) => {
            socket.emit("callUser", {
                userToCall: currentUser.uid,
                signalData: data,
                from: me,
                name: name
            })
        })
        peer.on("stream", (stream) => {

            userVideo.current.srcObject = stream

        })
        socket.on("callAccepted", (signal) => {
            setCallAccepted(true)
            peer.signal(signal)
        })

        connectionRef.current = peer
    }

    const answerCall = () => {
        setCallAccepted(true)
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        })
        peer.on("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: caller })
        })
        peer.on("stream", (stream) => {
            userVideo.current.srcObject = stream
        })

        peer.signal(callerSignal)
        connectionRef.current = peer
    }

    const leaveCall = () => {
        setCallEnded(true)
        connectionRef.current.destroy()
    }


    return (
        <div>
            {/* -------------------------------------- Pop up -------------------------------------- */}
            <div>
                <button type="button" className="button" onClick={() => setOpen(o => !o)}>
                    Controlled Popup
                </button>
                <Popup open={open} closeOnDocumentClick onClose={closeModal}>
                    <div style={{ 'backgroundColor': '#ffffff' }}>
                        <button type="button" className="close" onClick={closeModal}>
                            &times;
                        </button>

                        <>
                            <h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
                            <div>
                                    {receivingCall && !callAccepted ? (
                                        <div className="caller">
                                            <h1 >{name} is calling</h1>
                                            <Button variant="contained" color="primary" onClick={answerCall}>
                                                Answer
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                            <div className="container">
                                <div className="video-container">
                                    <div className="video">
                                        {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
                                    </div>
                                    <div className="video">
                                        {callAccepted && !callEnded ?
                                            <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} /> :
                                            null}
                                    </div>
                                </div>
                                <div className="myId">
                                    <TextField
                                        id="filled-basic"
                                        label="Name"
                                        variant="filled"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        style={{ marginBottom: "20px" }}
                                    />
                                    <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
                                        <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
                                            Copy ID
                                        </Button>
                                    </CopyToClipboard>

                                    <TextField
                                        id="filled-basic"
                                        label="ID to call"
                                        variant="filled"
                                        value={idToCall}
                                        onChange={(e) => setIdToCall(e.target.value)}
                                    />
                                    <div className="call-button">
                                        {callAccepted && !callEnded ? (
                                            <Button variant="contained" color="secondary" onClick={leaveCall}>
                                                End Call
                                            </Button>
                                        ) : (
                                            // -------------------------------------------------------------------------------
                                            // <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}></IconButton>
                                            <IconButton color="primary" aria-label="call" onClick={() => callUser(currentUser.uid)}>
                                                <PhoneIcon fontSize="large" />
                                            </IconButton>
                                        )}
                                        {idToCall}
                                    </div>
                                </div>

                            </div>
                        </>
                    </div>
                </Popup>
            </div>

            {/* <Popup
                trigger={<button className="button"> Open Modal </button>}
                modal
                nested
            >
                {close => (
                    <div style={{ 'fontSize': 12, 'background': '#ffffff' }}>
                        <button style={{'cursor': 'pointer', 'position': 'absolute', 'display': 'block', 'padding': '2px 5px', 'lineHeight': 1, 'right': -10, 'top': -10, 'fontSize': 24, 'background': '#ffffff', 'borderRadius': 18, 'border': '1px solid #cfcece'}} onClick={close}>
                            &times;
                        </button>
                        <div style={{ 'width': '100%', 'borderBottom': '1px solid gray', 'fontSize': 18, 'textAlign': 'center', 'padding': 5 }}> Modal Title </div>
                        <div className="content">
                            {' '}
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, a nostrum.
                            Dolorem, repellat quidem ut, minima sint vel eveniet quibusdam voluptates
                            delectus doloremque, explicabo tempore dicta adipisci fugit amet dignissimos?
                            <br />
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur sit
                            commodi beatae optio voluptatum sed eius cumque, delectus saepe repudiandae
                            explicabo nemo nam libero ad, doloribus, voluptas rem alias. Vitae?
                        </div>
                        <div className="actions">
                            <Popup
                                trigger={<button className="button"> Trigger </button>}
                                position="top center"
                                nested
                            >
                                <span>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae
                                    magni omnis delectus nemo, maxime molestiae dolorem numquam
                                    mollitia, voluptate ea, accusamus excepturi deleniti ratione
                                    sapiente! Laudantium, aperiam doloribus. Odit, aut.
                                </span>
                            </Popup>
                            <button
                                className="button"
                                onClick={() => {
                                    console.log('modal closed ');
                                    close();
                                }}
                            >
                                close modal
                            </button>
                        </div>
                    </div>
                )}
            </Popup> */}
            {/* -------------------------------------- Pop up -------------------------------------- */}
        </div>
    )
}
