import React from 'react';
import { Modal, Backdrop, Card, CardContent, Typography } from '@mui/material';

function SessionModal({ open, onClose, sessionObj }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <div>
        <Card>
          <CardContent>
            <Typography variant="h5">{sessionObj.id}</Typography>
            <Typography>
              Recorded Date: {sessionObj.data.recordedDate.toDate().toLocaleDateString()}
            </Typography>
            <Typography>Session Time: {sessionObj.data.sessionTime}</Typography>
            <Typography>Students Present: {sessionObj.data.presentCount}</Typography>
            <Typography>
              {sessionObj.data.labBatch ? `Lab Batch: ${sessionObj.data.labBatch}` : 'Theory'}
            </Typography>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}

export default SessionModal;
