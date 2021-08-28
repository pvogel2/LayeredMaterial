import React from 'react';

import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

function Slope(props) {
  const {
    onBoundariesChange = () => {},
    onTransitionChange = () => {},
    lower = 0,
    upper = 1,
    transition = 0,
    min = 0,
    max = 1,
  } = props;

  function handleBoundariesChange(event, values) {
    onBoundariesChange(values);
  }

  function handleTransitionChange(event, value) {
    onTransitionChange(value);
  }

  const marks = [
    { 
      value: min,
      label: `${min * 100}%`,
    },
    {
      value: max,
      label: `${max * 100}%`,

    },
  ];

  function valuetext(value) {
    return `${value * 100}%`;
  }

  return (
    <>
    <Typography gutterBottom>
      slope Min Max
    </Typography>
    <Slider
      min={min}
      max={max}
      value={[lower, upper]}
      onChange={handleBoundariesChange}
      valueLabelDisplay="auto"
      valueLabelFormat={ (x) => `${x * 100}%` }
      aria-labelledby="slope-slider"
      getAriaValueText={valuetext}
      step={0.05}
      marks={marks}
    />
    <Typography gutterBottom>
      slope Transition
    </Typography>
    <Slider
      min={min}
      max={max}
      defaultValue={transition}
      onChange={handleTransitionChange}
      valueLabelDisplay="auto"
      valueLabelFormat={ (x) => `${x * 100}%` }
      aria-labelledby="slope-transition-slider"
      getAriaValueText={valuetext}
      step={0.05}
      marks={marks}
    />
    </>
  )
}

export default Slope;