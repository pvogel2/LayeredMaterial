import React, { useState } from 'react';

import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

function Slope(props) {
  const {
    onChange = () => {},
    lowerLimit = 0,
    upperLimit = 1,
    lowerTrns = 0,
    upperTrns = 0,
    min = 0,
    max = 1,
  } = props;

  const [limit, setLimit] = useState([lowerLimit, upperLimit]);
  const [trns, setTrns] = useState([lowerTrns, upperTrns]);

  function handleTrnsChange(_, values) {
    setTrns([Math.abs(values[0]), Math.abs(values[1])]);
    onChange({
      limit,
      trns,
    });
  }

  function handleLimitChange(_, values) {
    setLimit(values);
    onChange({
      limit,
      trns,
    });
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
      slope
    </Typography>
    <Slider
      min={min}
      max={max}
      value={limit}
      onChange={handleLimitChange}
      valueLabelDisplay="auto"
      aria-labelledby="slope-limit-slider"
      valueLabelFormat={ (x) => `${x * 100}%` }
      getAriaValueText={valuetext}
      marks={marks}
      step={0.05}
    />
    <Slider
      min={-1*max}
      max={max}
      value={[-Math.abs(trns[0]), Math.abs(trns[1])]}
      onChange={handleTrnsChange}
      valueLabelDisplay="auto"
      aria-labelledby="slope-trns-slider"
      valueLabelFormat={ (x) => `${x * 100}%` }
      getAriaValueText={valuetext}
      marks={marks}
      step={0.05}
    />
    </>
  )
}

export default Slope;