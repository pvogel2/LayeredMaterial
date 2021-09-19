import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
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

function MaterialSettings(props) {
  const { minmax, randomize, triplanar, layer, material, dispatch } = props;

  const [dialogOpen, setDialogOpen] = useState(true);

  const [expandedLayer, setExpandedLayer] = useState('');

  const [randomizeChecked, setRandomizeChecked] = useState(randomize);

  const [triplanarChecked, setTriplanarChecked] = useState(triplanar);

  function handleKeyDown(e) {
    if (e.key !== 'm') return;
    toggleDialog = !toggleDialog;
    setDialogOpen(toggleDialog);
  
  }

  function onLayerChange(layer) {
    dispatch({ type: 'UPDATE_LAYER', payload: layer });
  }

  const handleChange = (layerId, expanded) => {
   setExpandedLayer(expanded ? layerId : '');
  };

  function onRandomizeChange(event) {
    const checked = event.target.checked;
    dispatch({ type: 'RANDOMIZE', payload: checked });
    setRandomizeChecked(checked);
  }

  function onTriplanarChange(event) {
    const checked = event.target.checked;
    dispatch({ type: 'TRIPLANAR', payload: checked });
    setTriplanarChecked(checked);
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
  const mLayers = material && material.layers?.map(l => 
    <Layer
      className={classes.layer}
      key={l.id}
      min={minmax[0]}
      max= {minmax[1]}
      layer={l}
      expandedLayer={expandedLayer}
      onChange={handleChange}
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
        <FormGroup>
        <FormControlLabel
          control={<Switch checked={randomizeChecked} onChange={onRandomizeChange} name="randomization" />}
          label="Tile randomization"
        />
        <FormControlLabel
          control={<Switch checked={triplanarChecked} onChange={onTriplanarChange} name="triplanar" />}
          label="Triplanar mapping"
        />
        </FormGroup>
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
    triplanar: state.triplanar,
    minmax: state.minmax,
  };
};

export default connect(
  mapStateToProps,
)(MaterialSettings);
