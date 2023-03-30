import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import { Guess } from './Guess';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  PointElement,
  Filler,
);

interface GuessProgressionProps {
  guesses: Array<Guess>;
  lexicon: Record<string, number>;
}

const options = {
  responsive: true,
  elements: {
    point: {
      radius: 0,
    },
  },
  plugins: {
    title: {
      display: true,
      text: 'Guess Progression',
    },
  },
};

function GuessProgression({ guesses, lexicon }: GuessProgressionProps): JSX.Element {
  let best = 0;
  const series = guesses.map(([lex], idx) => {
    const current = lexicon[lex] ?? 0;
    best = Math.max(current, best);
    return [current, best];
  });

  const data = {
    labels: series.map((_, idx) => idx),
    datasets: [
      {
        label: 'Best guess hits',
        data: series.map(([_, bestHits]) => bestHits),
        backgroundColor: '#CEA2AC',
        borderColor: '#8F3985',
      },
      {
        label: 'Guess hits',
        data: series.map(([current]) => current),
        backgroundColor: '#CEA2AC',
        borderColor: '#8F3985',
        elements: {
          point: {
            pointRadius: 3,
          },
        },
        fill: '-1',
      },
    ],
  };

  return (
    <Box>
      <Line options={options} data={data} />
      <Typography>
        Current guess count vs best count so far with the
        fill area showing how much you were struggling since your last
        progression.
      </Typography>
    </Box>
  );
}

export default GuessProgression;
