import React, { useState, useEffect } from 'react';
import { MeshStandardMaterial, DoubleSide } from 'three';
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

const testMaterial = new  MeshStandardMaterial({ side: DoubleSide });
function MaterialSettings(props) {
  const { minmax, randomize, triplanar, bumpmap, material, dispatch } = props;

  const [dialogOpen, setDialogOpen] = useState(true);

  const [expandedLayer, setExpandedLayer] = useState('');

  const [randomizeChecked, setRandomizeChecked] = useState(randomize);

  const [triplanarChecked, setTriplanarChecked] = useState(triplanar);

  const [testMaterialChecked, setTestMaterialChecked] = useState(false);

  const [layeredMaterial, setLayeredMaterial] = useState(null);

  const [bumpmapChecked, setBumpmapChecked] = useState(bumpmap);

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

  function onBumpmapChange(event) {
    const checked = event.target.checked;
    dispatch({ type: 'BUMPMAP', payload: checked });
    setBumpmapChecked(checked);
  }

  function onTestMaterialChange(event) {
    const checked = event.target.checked;

    if (!layeredMaterial && material && !material.type.startsWith('MeshLayeredMaterial')) {
      console.log('invalid state found.');
      return;
    }

    if (checked && material.type.startsWith('MeshLayeredMaterial')) {
      console.log(material);
      setLayeredMaterial(material);
    }
    dispatch({ type: 'SET_MATERIAL', payload: checked ? testMaterial : layeredMaterial });
    setTestMaterialChecked(checked);
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
          control={<Switch disabled={testMaterialChecked} checked={randomizeChecked} onChange={onRandomizeChange} name="randomization" />}
          label="Tile randomization"
        />
        <FormControlLabel
          control={<Switch disabled={testMaterialChecked} checked={triplanarChecked} onChange={onTriplanarChange} name="triplanar" />}
          label="Triplanar mapping"
        />
        <FormControlLabel
          control={<Switch disabled={testMaterialChecked} checked={bumpmapChecked} onChange={onBumpmapChange} name="bumpmap" />}
          label="Bump mapping"
        />
        <FormControlLabel
          control={<Switch checked={testMaterialChecked} onChange={onTestMaterialChange} name="testmat" />}
          label="Apply test material"
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
    bumpmap: state.bumpmap,
  };
};

export default connect(
  mapStateToProps,
)(MaterialSettings);
