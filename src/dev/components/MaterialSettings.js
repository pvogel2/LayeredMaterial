import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { Card, CardContent, CardHeader, Avatar, IconButton, Switch, FormGroup, FormControlLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import Layer from './layer.js';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)({
  minWidth: '275px',
  position: 'absolute',
  top: '30px',
  left: '30px',
  zIndex: '1',
});

const StyledLayer = styled(Layer)({
  textTransform: 'capitalize',
  width: '100%',
  margin: '8px',
});

const StyledAvatar = styled(Avatar)(({theme}) => ({
  backgroundColor: theme.palette.secondary.main,
}));

const StyledContent = styled(CardContent)({
  margin: '0 8px',
});

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

  if (!dialogOpen) return null;

  const mLayers = material && material.layers?.map(l => 
    <StyledLayer
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
    <StyledCard>
      <CardHeader
        avatar={
          <StyledAvatar aria-label="recipe">
            M
          </StyledAvatar>
        }
        action={
          <IconButton aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
        title="Material settings"
        subheader="Changes applied on the fly"
      />
      <StyledContent>
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
      </StyledContent>
    </StyledCard>
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
