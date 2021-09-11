import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

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
  const { meshes, mesh, dispatch } = props;

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

  function handleMeshChange(event) {
    const name = event.target.value;
    if (mesh && mesh !== name) {
      dispatch({ type: 'REMOVE_MESH', payload: mesh });
    }
    dispatch({ type: 'ADD_MESH', payload: name });
  }

  useEffect(() => {    
    document.addEventListener('keydown', handleKeyDown, false);

    return () => document.removeEventListener('keydown', handleKeyDown, false);
  }, []);

  const classes = useStyles();

  const mRadios = meshes && meshes.map((m) => (
    <FormControlLabel checked={m.name === mesh} value={m.name} control={<Radio />} label={m.name}/>
  )) || '';

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
        <FormControl component="fieldset">
          <FormLabel component="legend">{mesh}</FormLabel>
          <RadioGroup aria-label="renderedMesh" name="renderedMesh" value={mesh} onChange={handleMeshChange}>
            {mRadios}
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Card>
  );
};

function mapStateToProps(state) {
  return {
    meshes: state.meshes,
    mesh: state.mesh,
  };
};

export default connect(
  mapStateToProps,
)(SceneSettings);
