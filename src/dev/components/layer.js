import React from 'react';

import Range from './range';
import Slope from './slope';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

function Layer(props) {
  const {
    onBoundariesChange = () => {},
    onChange = () => {},
    layer,
    min = 0,
    max = 100,
    expandedLayer = '',
    className = '',
  } = props;

  function onAccordionChange(event, expanded) {
    onChange(layer.id, expanded);
  }

  function handleRangeChange(values) {
    const { id } = { ...layer };
    const l = {
      id,
      range: [...values.limit],
      rangeTrns: [...values.trns],
    };
    l.rangeName = layer.rangeName;
    l.rangeTrnsName = layer.rangeTrnsName;

    onBoundariesChange(l);
  }

  function handleSlopeChange(values) {
    const { id } = { ...layer };
    const l = {
      id,
      slope: [...values.limit],
      slopeTrns: [...values.trns],
      slopeDstrbStrength: [...values.dstrbStrength],
      slopeDstrbOctaves: [...values.dstrbOctaves],
    };
    l.slopeName = layer.slopeName;
    l.slopeTrnsName = layer.slopeTrnsName;
    l.slopeDstrbStrengthName = layer.slopeDstrbStrengthName;
    l.slopeDstrbOctavesName = layer.slopeDstrbOctavesName;

    onBoundariesChange(l);
  }

  function handleToggleLayerClick(e) {
    e.stopPropagation();
    layer.toggle();
    const l = {
      enabled: layer.enabled,
    }
    onBoundariesChange(l);
  }

  const range = !layer.range
    ? null
    : (
      <Range
        min={min}
        max={max}
        limit={[...layer.range]}
        trns={[...layer.rangeTrns]}
        onChange={handleRangeChange}
      />
    );

    const slope = !layer.slope
    ? null
    : (
      <Slope
        limit={[...layer.slope]}
        trns={[...layer.slopeTrns]}
        slopeDstrbStrength = {[...layer.slopeDstrbStrength]}
        slopeDstrbOctaves = {[...layer.slopeDstrbOctaves]}
        onChange={handleSlopeChange}
      />
    );


  return (
    <Accordion expanded={expandedLayer === layer.id} onChange={onAccordionChange}>

      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <Box sx={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
        <Typography variant='h6'>{layer.id}</Typography>
        { layer.enabled && <VisibilityIcon fontSize='small' onClick={handleToggleLayerClick} sx={{margin: 'auto 10px auto 0'}}/> }
        { !layer.enabled && <VisibilityOffIcon fontSize='small' onClick={handleToggleLayerClick} sx={{margin: 'auto 10px auto 0'}}/> }
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <div className={className}>
          {range}
          {slope}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default Layer;