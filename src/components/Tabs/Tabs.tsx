import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Badge } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
type TabExtraData = {
  label: string;
};
type TabProps = {
  tabsinject: TabExtraData[];
};

type ControlledTabsProps = {
  value: number;
  handleChange: (event: React.SyntheticEvent, newValue: number) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  badgeContent?: number
};

type CombinedProps = ControlledTabsProps & TabProps;

export const ControlledTabs: React.FC<CombinedProps> = ({
  value,
  handleChange,
  tabsinject,
  children,
  badgeContent,
  ...rest
}) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          {...rest}
        >
          {tabsinject.map((item: any, index: any) => (
            <Tab
             label={
              <Badge badgeContent={badgeContent} color='primary'>
                {item.label}
              </Badge>
            } 
            {...a11yProps(index)} key={index} />
          ))}
        </Tabs>
      </Box>
      {children}
    </Box>
  );
};