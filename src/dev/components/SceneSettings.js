import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';


import { Card, CardContent, CardHeader, Avatar, IconButton } from '@mui/material';
import { FormControl, FormControlLabel, FormLabel, RadioGroup, Radio } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)({
  minWidth: '275px',
  position: 'absolute',
  top: '30px',
  right: '30px',
  zIndex: '1',
});

const StyledAvatar = styled(Avatar)(({theme}) => ({
  backgroundColor: theme.palette.secondary.main,
}));

const StyledContent = styled(CardContent)({
  margin: '0 8px',
});

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

  const mRadios = meshes && meshes.map((m, idx) => (
    <FormControlLabel key={`formCtrl${idx}`} checked={m.name === mesh} value={m.name} control={<Radio />} label={m.name}/>
  )) || '';

  if (!dialogOpen) return null;

  return (
    <StyledCard>
      <CardHeader
        avatar={
          <StyledAvatar aria-label="recipe">
            S
          </StyledAvatar>
        }
        action={
          <IconButton aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
        title="Scene settings"
        subheader="Changes applied on the fly"
      />
      <StyledContent>
        <FormControl component="fieldset">
          <FormLabel component="legend">{mesh}</FormLabel>
          <RadioGroup aria-label="renderedMesh" name="renderedMesh" value={mesh} onChange={handleMeshChange}>
            {mRadios}
          </RadioGroup>
        </FormControl>
      </StyledContent>
    </StyledCard>
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
