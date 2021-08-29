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

import Layer from './layer.js';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    minWidth: 275,
    position: 'absolute',
    top: '30px',
    left: '30px',
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

function Dialog(props) {
  const { randomize, layer, material, dispatch } = props;

  const [dialogOpen, setDialogOpen] = useState(true);

  const [randomizeChecked, setRandomizeChecked] = useState(randomize);

  function handleKeyDown(e) {
    if (e.key !== 'm') return;
    toggleDialog = !toggleDialog;
    setDialogOpen(toggleDialog);
  
  }

  function onLayerChange(layer) {
    dispatch({ type: 'UPDATE_LAYER', payload: layer });
  }

  function onRandomizeChange(event) {
    const checked = event.target.checked;
    dispatch({ type: 'RANDOMIZE', payload: checked });
    setRandomizeChecked(checked);
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

  // const mLayers = material ? material.layers.map(l =>
  const mLayers = material && material.layers.map(l => 
    <Layer
      className={classes.layer}
      key={l.id}
      min={-5}
      max= {5}
      layer={l}
      onBoundariesChange={onLayerChange}
    />
  ).reverse() || '';

  return (
    <Card className={classes.card}>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" className={classes.avatar}>
            M
          </Avatar>
        }
        action={
          <IconButton aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
        title="Material settings"
        subheader="Changes applied on the fly"
      />
      <CardContent className={classes.root}>
        <FormControlLabel
          control={<Switch checked={randomizeChecked} onChange={onRandomizeChange} name="randomization" />}
          label="Tile Randomization"
        />
        {mLayers}
      </CardContent>
    </Card>
  );
};

function mapStateToProps(state) {
  return {
    material: state.material,
    layer: state.layer,
    randomize: state.randomize,
  };
};

export default connect(
  mapStateToProps,
)(Dialog);
