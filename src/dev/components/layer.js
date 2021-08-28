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
    onParametersChange = () => {},
    layer,
    min = 0,
    max = 100,
    className = '',
  } = props;

  function handleRangeChange(values) {
    const l = Object.assign({}, layer);
    console.log('values', values);

    l.range[0] = values.limit[0];
    l.range[1] = values.limit[1];
    l.rangeTrns[0] = values.trns[0];
    l.rangeTrns[1] = values.trns[1];
    onBoundariesChange(l);
  }

  function handleSlopeBoundariesChange(values) {
    const l = Object.assign({}, layer);
    l.slope[0] = values[0];
    l.slope[1] = values[1];
    onBoundariesChange(l);
  }

  function handleSlopeTransitionChange(value) {
    const l = Object.assign({}, layer);
    l.slopeTransition = value;
    onParametersChange(l);
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
        lower={layer.slope[0]}
        upper={layer.slope[1]}
        transition={layer.slopeTransition}
        onBoundariesChange={handleSlopeBoundariesChange}
        onTransitionChange={handleSlopeTransitionChange}
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