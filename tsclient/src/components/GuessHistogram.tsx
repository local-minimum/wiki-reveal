import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import { Guess } from './Guess';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

export const options = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Guess Quality',
    },
  },
};

function zeroFillArray(arr: Array<number | undefined>): Array<number> {
  return [...arr].map((value) => value ?? 0);
}

function countGuesses(
  guesses: Array<Guess>,
  lexicon: Record<string, number>,
): Array<number | undefined> {
  const counts: Array<number | undefined> = [];
  guesses
    .forEach(([lex]) => {
      const frequency = lexicon[lex];
      counts[frequency] = (counts[frequency] ?? 0) + 1;
    });

  return counts;
}

interface GuessHistogramProps {
  guesses: Array<Guess>;
  lexicon: Record<string, number>;
}

function GuessHistogram({ guesses, lexicon }: GuessHistogramProps): JSX.Element {
  const histogram = zeroFillArray(countGuesses(guesses, lexicon));

  const data = {
    labels: histogram.map((_, idx) => idx),
    datasets: [
      {
        label: 'Guess Qualities',
        data: histogram,
        backgroundColor: '#CEA2AC',
        borderColor: '#8F3985',
      },
    ],
  };

  return (
    <Box>
      <Bar options={options} data={data} />
      <Typography>
        Number of guesses made (y-axis) on words with
        {' '}
        <em>n</em>
        {' '}
        occurances in the article (x-axis).
      </Typography>
    </Box>
  );
}

export default GuessHistogram;
