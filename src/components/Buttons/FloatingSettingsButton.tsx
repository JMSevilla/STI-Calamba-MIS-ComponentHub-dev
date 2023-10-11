import React from "react";
import { Fab, IconButton, styled } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';

interface FloatingSettingsButtonProps {
  onToggleDrawer: () => void;
}

const FloatingSettingsButton: React.FC<FloatingSettingsButtonProps> = ({
  onToggleDrawer,
}) => {
  return (
    <Fab
      size="small"
      color="inherit"
      aria-label="Settings"
      onClick={onToggleDrawer}
      sx={{
        position: 'fixed',
        right: 20,
        top: 100,
        zIndex: 1000
      }}
    >
      <IconButton size="small">
        <SettingsIcon />
      </IconButton>
    </Fab>
  );
};

export default FloatingSettingsButton;
