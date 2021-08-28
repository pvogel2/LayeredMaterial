import React, { useState } from 'react';

import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

function Range(props) {
  const {
    onChange = () => {},
    lowerLimit = 0,
    upperLimit = 100,
    lowerTrns = 0,
    upperTrns = 0,
    min = 0,
    max = 100,
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
    console.log('limit', limit, trns);
    onChange({
      limit,
      trns,
    });
  }

  const marks = [
    {
      value: min,
      label: `${min}m`,

    },
    {
      value: max,
      label: `${max}m`,

    },
  ];

  function valuetext(value) {
    return `${value}m`;
  }

  return (
    <>
    <Typography gutterBottom>
    range
    </Typography>
    <Slider
      min={min}
      max={max}
      value={limit}
      onChange={handleLimitChange}
      valueLabelDisplay="auto"
      aria-labelledby="range-limit-slider"
      getAriaValueText={valuetext}
      marks={marks}
    />
    <Slider
      min={min}
      max={max}
      value={[-Math.abs(trns[0]), Math.abs(trns[1])]}
      onChange={handleTrnsChange}
      valueLabelDisplay="auto"
      aria-labelledby="range-trns-slider"
      getAriaValueText={valuetext}
      marks={marks}
    />
    </>
  )
}

export default Range;