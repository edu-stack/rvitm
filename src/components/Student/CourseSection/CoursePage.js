import * as React from 'react';
import PropTypes from 'prop-types';

import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Course from './Course';
import CourseMaterial from './CourseMaterial/CourseMaterial'
import StudentTopNavbar from '../MobileNav/StudentTopNavbar';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function CoursePage() {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  return (
    <><StudentTopNavbar text={'Course Section'}/><Box>
          <AppBar position="static">

              <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="secondary"
                  textColor="inherit"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                  style={{  backgroundColor: 'white', alignItems: 'center', color: 'black',fontSize: '12px' }}
              >
                  <Tab label="Class Schedule" {...a11yProps(0)} style={{fontSize: '10px'}}/>
                  <Tab label="Study Material" {...a11yProps(1)} style={{fontSize: '10px'}} />
                  <Tab label="Assignments" {...a11yProps(2)} style={{fontSize: '10px'}}/>

              </Tabs>
          </AppBar>

          <TabPanel value={value} index={0} dir={theme.direction}>
              <Course />
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>
              <CourseMaterial />
          </TabPanel>
          <TabPanel value={value} index={2} dir={theme.direction}>
              No New Assignments
          </TabPanel>


      </Box></>
  );
}
