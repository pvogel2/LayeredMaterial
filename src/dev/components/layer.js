import React from 'react';

import Range from './range';
import Slope from './slope';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';

function Layer(props) {
  const {
    onBoundariesChange = () => {},
    layer,
    min = 0,
    max = 100,
    className = '',
  } = props;

  function handleRangeChange(values) {
    const { id, uRangeId, uRangeTrnsId } = { ...layer };
    const l = {
      id,
      uRangeId,
      uRangeTrnsId,
      range: [...values.limit],
      rangeTrns: [...values.trns],
    };
    onBoundariesChange(l);
  }

  function handleSlopeChange(values) {
    const { id, uSlopeId, uSlopeTrnsId } = { ...layer };
    const l = {
      id,
      uSlopeId,
      uSlopeTrnsId,
      slope: [...values.limit],
      slopeTrns: [...values.trns],
    };
    onBoundariesChange(l);
  }

  const range = !layer.range
    ? null
    : (
      <Range
        min={min}
        max={max}
        lowerLimit={layer.range[0]}
        upperLimit={layer.range[1]}
        lowerTrns={layer.rangeTrns[0]}
        upperTrns={layer.rangeTrns[1]}
        onChange={handleRangeChange}
      />
    );

    const slope = !layer.slope
    ? null
    : (
      <Slope
        lowerLimit={layer.slope[0]}
        upperLimit={layer.slope[1]}
        lowerTrns={0}
        upperTrns={0}
        onChange={handleSlopeChange}
      />
    );


  return (
    <Accordion>
      <AccordionSummary>
        <Typography variant='h6'>{layer.id}</Typography>
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