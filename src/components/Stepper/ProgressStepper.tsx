import React, { useState } from 'react';
import { Stepper, Step, StepLabel, StepIconProps, Box, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
const stepColors = ['#2196F3', '#4CAF50', '#FFC107'];

type ProgressStepperProps = {
    activeStep: number
    steps: []
}

const BoardingStepIcon: React.FC<StepIconProps> = ({ active, completed }) => {
    return (
        <Box
        sx={{
            borderRadius: '100%',
            borderColor: (theme) => {
                if(completed || active){
                    return theme.palette.secondary.light
                }
                return theme.palette.grey[400]
            },
            borderStyle: 'solid',
            borderWidth: () => {
                if(active) return [4, 6]
                return 2;
            },
            backgroundColor: 'white',
            width: [15, 20],
            height: [15, 20],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        >
            {completed && <CheckIcon sx={{ color: 'secondary.light', width: ['0.4em', '0.6em']}} />}
        </Box>
    )
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ activeStep = 0, steps}) => {

  return (
    <div>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} completed={activeStep > index} active={index === activeStep}>
            <StepLabel StepIconComponent={BoardingStepIcon}>
                <Box sx={{ width: '70%', mx: 'auto' }}>
                            <Typography
                            fontWeight={activeStep === index ? 'bold' : 'normal'}
                            fontSize='0.6rem'
                            variant='caption'
                            display='flex'
                            alignItems='center'
                            >
                                {label}
                            </Typography>
                        </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default ProgressStepper;
