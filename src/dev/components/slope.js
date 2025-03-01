import React, { useState } from 'react';

import { Slider, Typography } from '@mui/material';

function Slope(props) {
  const {
    onChange = () => {},
    limit = [0, 1],
    trns = [0, 0],
    dstrbStrength = [0, 0],
    dstrbOctaves = [0, 0],
    min = 0,
    max = 1,
  } = props;

  const [vLimit, setLimit] = useState([...limit]);
  const [vTrns, setTrns] = useState([...trns]);
  const [vDstrbStrength, setDstrbStrength] = useState([...dstrbStrength]);
  const [vDstrbOctaves, setDstrbOctaves] = useState([...dstrbOctaves]);

  function handleTrnsChange(_, values) {
    setTrns([Math.abs(values[0]), Math.abs(values[1])]);
    onChange({
      limit: vLimit,
      trns: vTrns,
      dstrbStrength: vDstrbStrength,
      dstrbOctaves: vDstrbOctaves,
    });
  }

  function handleLimitChange(_, values) {
    setLimit(values);
    onChange({
      limit: vLimit,
      trns: vTrns,
      dstrbStrength: vDstrbStrength,
      dstrbOctaves: vDstrbOctaves,
    });
  }

  function handleDstrbStrengthChange(_, values) {
    setDstrbStrength([Math.abs(values[0]), Math.abs(values[1])]);
    onChange({
      limit: vLimit,
      trns: vTrns,
      dstrbStrength: vDstrbStrength,
      dstrbOctaves: vDstrbOctaves,
    });
  }

  function handleDstrbOctavesChange(_, values) {
    console.log('handleDstrbOctavesChange', values);
    setDstrbOctaves([Math.abs(values[0]), Math.abs(values[1])]);
    onChange({
      limit: vLimit,
      trns: vTrns,
      dstrbStrength: vDstrbStrength,
      dstrbOctaves: vDstrbOctaves,
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

  const marks2 = [
    { 
      value: -1,
      label: `-1`,
    },
    {
      value: 1,
      label: `1`,

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
      value={vLimit}
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
      value={[-Math.abs(vTrns[0]), Math.abs(vTrns[1])]}
      onChange={handleTrnsChange}
      valueLabelDisplay="auto"
      aria-labelledby="slope-trns-slider"
      valueLabelFormat={ (x) => `${x * 100}%` }
      getAriaValueText={valuetext}
      marks={marks}
      step={0.05}
    />
    <Slider
      min={-1}
      max={1}
      value={[-Math.abs(vDstrbStrength[0]), Math.abs(vDstrbStrength[1])]}
      onChange={handleDstrbStrengthChange}
      valueLabelDisplay="auto"
      aria-labelledby="slope-dstrb-strength-slider"
      valueLabelFormat={ (x) => `${x}` }
      getAriaValueText={(x) => `${x}`}
      marks={marks2}
      step={0.05}
    />
    <Slider
      min={-10}
      max={10}
      value={[-Math.abs(vDstrbOctaves[0]), Math.abs(vDstrbOctaves[1])]}
      onChange={handleDstrbOctavesChange}
      valueLabelDisplay="auto"
      aria-labelledby="slope-dstrb-octaves-slider"
      valueLabelFormat={ (x) => `${x}` }
      getAriaValueText={(x) => `${x}`}
      marks={marks2}
      step={0.05}
    />
    </>
  )
}

export default Slope;