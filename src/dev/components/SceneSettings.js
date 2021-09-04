import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    minWidth: 275,
    position: 'absolute',
    top: '30px',
    right: '30px',
    zIndex: 1,
  },
  layer: {
    textTransform: 'capitalize',
    width: '100%',
    margin: 8
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
  root: {
    margin: '0 8px',
  }
}));

let toggleDialog = false;

function SceneSettings(props) {
  const { dispatch } = props;

  const [dialogOpen, setDialogOpen] = useState(true);

  function handleKeyDown(e) {
    if (e.key !== 's') return;
    toggleDialog = !toggleDialog;
    setDialogOpen(toggleDialog);
  
  }

  function onClose() {
    toggleDialog = false;
    setDialogOpen(false);
  }

  useEffect(() => {    
    document.addEventListener('keydown', handleKeyDown, false);

    return () => document.removeEventListener('keydown', handleKeyDown, false);
  }, []);

  const classes = useStyles();

  if (!dialogOpen) return null;

  return (
    <Card className={classes.card}>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" className={classes.avatar}>
            S
          </Avatar>
        }
        action={
          <IconButton aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
        title="Scene settings"
        subheader="Changes applied on the fly"
      />
      <CardContent className={classes.root}>
      </CardContent>
    </Card>
  );
};

function mapStateToProps(state) {
  return {
  };
};

export default connect(
  mapStateToProps,
)(SceneSettings);
