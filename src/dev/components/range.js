import React, { useState } from 'react';

import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

function Range(props) {
  const {
    onChange = () => {},
    limit = [0, 100],
    trns = [0, 0],
    min = 0,
    max = 100,
  } = props;

  const [vLimit, setLimit] = useState([...limit]);
  const [vTrns, setTrns] = useState([...trns]);

  const maxTrns = Math.abs(max - min);
  const minTrns = -1 * maxTrns;

  function handleTrnsChange(_, values) {
    setTrns([Math.abs(values[0]), Math.abs(values[1])]);
    onChange({
      limit: vLimit,
      trns: vTrns,
    });
  }

  function handleLimitChange(_, values) {
    setLimit(values);
    onChange({
      limit: vLimit,
      trns: vTrns,
    });
  }

  const marks = (mMin, mMax) => [
    {
      value: mMin,
      label: `${mMin}m`,

    },
    {
      value: 0,
      label: `0.0m`,

    },
   {
      value: mMax,
      label: `${mMax}m`,

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
      value={vLimit}
      onChange={handleLimitChange}
      valueLabelDisplay="auto"
      aria-labelledby="range-limit-slider"
      getAriaValueText={valuetext}
      marks={marks(min, max)}
      step={0.1}
    />
    <Slider
      min={minTrns}
      max={maxTrns}
      value={[-Math.abs(vTrns[0]), Math.abs(vTrns[1])]}
      onChange={handleTrnsChange}
      valueLabelDisplay="auto"
      aria-labelledby="range-trns-slider"
      getAriaValueText={valuetext}
      marks={marks(minTrns, maxTrns)}
      step={0.1}
    />
    </>
  )
}

export default Range;