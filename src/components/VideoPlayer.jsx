import React, { useContext, useEffect, useState } from 'react';
import { Grid, Typography, Paper, makeStyles, Button } from '@material-ui/core';
import { RecordRTCPromisesHandler } from 'recordrtc';
import { Voicemail } from '@material-ui/icons';
// import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { SocketContext } from '../Context';

// const S3 = require('aws-sdk/clients/s3');
const AWS = require('aws-sdk');
// const apiURL = process.env.REACT_APP_API_ADDRESS;
const useStyles = makeStyles((theme) => ({
  video: {
    width: '550px',
    [theme.breakpoints.down('xs')]: {
      width: '300px',
    },
  },
  gridContainer: {
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  paper: {
    padding: '10px',
    border: '2px solid black',
    margin: '10px',
  },
}));

const VideoPlayer = () => {
  const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } = useContext(SocketContext);
  const classes = useStyles();
  const [isRecord, setIsRecord] = useState(false);
  const [recorder, setRecorder] = useState();
  // eslint-disable-next-line
  const [translatedSentence, setTranslatedSentence] = useState('자막이 여기 표시됩니다.');
  //   const eventsource = new EventSource
  const startRecording = async () => {
    recorder.startRecording();
  };

  const stopRecording = async () => {
    await recorder.stopRecording();
    const blob = await recorder.getBlob();
    const s3 = new AWS.S3();
    let filename = uuidv4();
    const file = filename;
    filename += '.webm';
    s3.putObject({
      Body: blob,
      Bucket: 'gyhibo-databucket',
      Key: filename,
    }, async (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(data);
        const sendingData = {
          name: file,
        };
        const translateAPI = 'https://api.makeyourpage.net/api/translate';
        console.log(translateAPI);
        // eslint-disable-next-line
        fetch(translateAPI, {
          method: 'POST',
          headers: {
            'Content-Type': 'Application/json',
          },
          body: JSON.stringify(sendingData),
          // eslint-disable-next-line
        }).then((res) => res.json())
          .then((r) => {
            console.log(r.translated_word);
            setTranslatedSentence(r.translated_word);
            s3.deleteObject({
              Bucket: 'gyhibo-databucket',
              Key: filename,
            });
          })
        // eslint-disable-next-line
        .catch((err) => {console.log(err);});
      }
    });
  };

  const getPermissionInitializeRecorder = async () => {
    const streamS = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const recorders = new RecordRTCPromisesHandler(streamS, {
      type: 'video',
    });
    setRecorder(recorders);
  };

  useEffect(() => {
    getPermissionInitializeRecorder();
    AWS.config.update({
      accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_S3_ACCESS_SECRET_ACCESS_KEY,
      region: process.env.REACT_APP_S3_REGION,
    });
    console.log(process.env.REACT_APP_S3_ACCESS_KEY_ID);
    console.log(process.env.REACT_APP_S3_ACCESS_SECRET_ACCESS_KEY);
    console.log(process.env.REACT_APP_S3_REGION);
  }, []);

  return (
    <Grid container className={classes.gridContainer}>
      {stream && (
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>{name || 'Name'}</Typography>
            <video playsInline muted ref={myVideo} autoPlay className={classes.video} />
          </Grid>
          {!isRecord ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Voicemail fontSize="large" />}
              fullWidth
              onClick={() => {
                if (callAccepted === true) {
                  setIsRecord(true);
                  startRecording();
                }
              }}
              className={classes.margin}
            >
              Record
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Voicemail fontSize="large" />}
              fullWidth
              onClick={() => {
                if (callAccepted === true) {
                  setIsRecord(false);
                  stopRecording();
                }
              }}
              className={classes.margin}
            >
              Stop
            </Button>
          )}
        </Paper>
      )}
      {callAccepted && !callEnded && (
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>{call.name || 'Name'}</Typography>
            <video playsInline ref={userVideo} autoPlay className={classes.video} />
          </Grid>
          <>{translatedSentence}</>
        </Paper>
      )}
    </Grid>
  );
};

export default VideoPlayer;
