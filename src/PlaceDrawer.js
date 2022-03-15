import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CloseIcon from '@mui/icons-material/Close';

import Place from './Place';


export default forwardRef(function PlaceDrawer({open, onClose, mobile, id, fromMap, onShowLocation}, ref) {
    return (
        <Drawer ref={ref}
            anchor={mobile ? "bottom" : "right"}
            open={open}
            onClose={onClose}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <CloseIcon onClick={onClose} fontSize={mobile ? "medium" : "large"} style={{ cursor: "pointer" }} />
          </Box>
          <Box sx={{ px: 2, minWidth: mobile ? "inherit" : 400, maxWidth: { sm: mobile ? "inherit" : 500, md: mobile ? "inherit" : 700}, maxHeight: mobile ? "70vh" : "inherit" }}>
            <Place id={id} mobile={mobile} fromMap={fromMap} onShowLocation={onShowLocation} />
          </Box>
        </Drawer>
    );
});
