import React from 'react';
import { 
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { selectYearOptions } from '../../store/selectors/vibeSearchSelectors.ts';
import { filterSongsByYear } from '../../store/actions/vibeSearchActions.ts';

const YearFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const years = useAppSelector(selectYearOptions);
  
  if (!years || years.length === 0) {
    return null;
  }

  const handleYearSelect = (yearId: string) => {
    dispatch(filterSongsByYear(yearId));
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          color: '#1DB954',
          fontWeight: 'medium',
        }}
      >
        Filter by Release Year
      </Typography>
      
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          flexWrap: 'wrap', 
          gap: 1,
          '& > *': {
            my: 0.5,
          }
        }}
      >
        {/* Always include 'All Years' option */}
        <Paper
          key={years[0].id}
          elevation={years[0].isSelected ? 3 : 2}
          onClick={() => handleYearSelect(years[0].id)}
          sx={{
            px: 2.5,
            py: 1.75,
            cursor: 'pointer',
            backgroundColor: years[0].isSelected ? 'rgba(29, 185, 84, 0.25)' : '#323232',
            color: years[0].isSelected ? '#fff' : 'inherit',
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
              backgroundColor: years[0].isSelected ? 'rgba(29, 185, 84, 0.3)' : '#3a3a3a',
            },
            border: years[0].isSelected ? '1px solid rgba(29, 185, 84, 0.6)' : 'none',
            fontWeight: 'medium',
          }}
        >
          <Typography variant="body1" fontWeight="medium">{years[0].year}</Typography>
        </Paper>
        
        {/* Show other years in normal size */}
        {years.slice(1).map((yearOption) => (
          <Paper
            key={yearOption.id}
            elevation={yearOption.isSelected ? 2 : 1}
            onClick={() => handleYearSelect(yearOption.id)}
            sx={{
              px: 2,
              py: 1.5,
              cursor: 'pointer',
              backgroundColor: yearOption.isSelected ? 'rgba(29, 185, 84, 0.2)' : '#323232',
              color: yearOption.isSelected ? '#fff' : 'inherit',
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                backgroundColor: yearOption.isSelected ? 'rgba(29, 185, 84, 0.25)' : '#3a3a3a',
              },
              border: yearOption.isSelected ? '1px solid rgba(29, 185, 84, 0.5)' : 'none',
            }}
          >
            <Typography variant="body1">{yearOption.year}</Typography>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
};

export default YearFilter; 