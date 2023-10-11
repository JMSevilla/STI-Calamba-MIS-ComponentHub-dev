import React from "react";
import { Drawer, Box } from "@mui/material";

interface FloatingSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode
}

const FloatingSettingsDrawer: React.FC<FloatingSettingsDrawerProps> = ({
  isOpen,
  onClose,
  children
}) => {
  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
    >
      <Box
      sx={{ width: 350 }}
      role="presentation"
      >
        {children}
      </Box>
    </Drawer>
  );
};

export default FloatingSettingsDrawer;
