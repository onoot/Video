// client\src\pages\main\Main.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../contex';
import { io } from 'socket.io-client';
import { fetchWatcher, fetchQueue, fetchPresets } from '../../http/dashboard';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import CreateWatcherModal from '../../ui/Modals/main/CreateWatcherModal';
import CreateQueueModal from '../../ui/Modals/main/CreateQueueModal';
import CreatePresetModal from '../../ui/Modals/main/CreatePresetModal';

const Main = () => {
  const { showNotification } = useNotification();

  const [watcherData, setWatcherData] = useState([]);
  const [queueData, setQueueData] = useState([]);
  const [presetsData, setPresetsData] = useState([]);

  const [openWatcherModal, setOpenWatcherModal] = useState(false);
  const [openQueueModal, setOpenQueueModal] = useState(false);
  const [openPresetModal, setOpenPresetModal] = useState(false);

  const loadData = async () => {
    try {
      const [watcherRes, queueRes, presetsRes] = await Promise.all([
        fetchWatcher(),
        fetchQueue(),
        fetchPresets(),
      ]);
      setWatcherData(watcherRes);
      setQueueData(queueRes);
      setPresetsData(presetsRes);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Unknown error';
      showNotification('error', `Failed to load dashboard: ${msg}`);
    }
  };

  useEffect(() => {
    loadData();
  }, [showNotification]);

  const handleCreate = () => {
    loadData();
  };

  const renderStatusChip = (status) => {
    let color = 'default';
    if (status === 'Completed') color = 'success';
    else if (status === 'Processing') color = 'warning';
    else if (status === 'Queued') color = 'info';
    else if (status === 'Error') color = 'error';
    return <Chip label={status} size="small" color={color} />;
  };

  return (
    <div className="row gx-5 mb-2 fade-in-scale">
      
      <div className="col-12 col-md-12 col-xl-12 mt-md-0 mt-4 d-flex flex-column">
        <div className="card card-plain h-100 d-flex flex-column card-hover">
          <div className="card-header pb-0 p-3 d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Queue</h6>
            <Tooltip title="Add new task">
              <IconButton
                size="small"
                onClick={() => setOpenQueueModal(true)}
                sx={{ color: 'primary.main' }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
          <div className="card-body p-3 position-relative flex-grow-1">
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, height: '100%' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Input</TableCell>
                    <TableCell>Output</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queueData.length > 0 ? (
                    queueData.map((row, idx) => (
                      <TableRow key={row.id || idx} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.input}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.output}
                        </TableCell>
                        <TableCell>{renderStatusChip(row.status)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={row.progress || 0}
                              sx={{ width: 80, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="body2" sx={{ minWidth: 40 }}>
                              {row.progress || 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                        Queue is empty
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-12 col-xl-12 d-flex flex-column">
        {/* Watcher */}
        <div className="card card-plain mb-4 h-100">
          <div className="card-header pb-0 p-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Watcher</h5>
            <Tooltip title="Add new watcher">
              <IconButton
                size="small"
                onClick={() => setOpenWatcherModal(true)}
                sx={{ color: 'primary.main' }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
          <div className="card-body p-3">
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Watch Directory</TableCell>
                    <TableCell>Output Directory</TableCell>
                    <TableCell>Preset</TableCell>
                    <TableCell>Rules</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {watcherData.length > 0 ? (
                    watcherData.map((row, idx) => (
                      <TableRow key={row.id || idx} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row.watchDir}</TableCell>
                        <TableCell>{row.outputDir}</TableCell>
                        <TableCell>{row.preset}</TableCell>
                        <TableCell>
                          <Box
                            component="code"
                            sx={{ fontSize: '0.875rem', bgcolor: 'grey.100', p: 0.5, borderRadius: 0.5 }}
                          >
                            {row.rules}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                        No watchers configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>

        {/* Presets */}
        <div className="card card-plain h-100">
          <div className="card-header pb-0 p-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Presets</h5>
            <Tooltip title="Add new preset">
              <IconButton
                size="small"
                onClick={() => setOpenPresetModal(true)}
                sx={{ color: 'primary.main' }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
          <div className="card-body p-3">
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>Resolution</TableCell>
                    <TableCell>Encoder</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {presetsData.length > 0 ? (
                    presetsData.map((row, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.format}</TableCell>
                        <TableCell>{row.resolution}</TableCell>
                        <TableCell>
                          <Box
                            component="code"
                            sx={{ fontSize: '0.875rem', bgcolor: 'grey.100', p: 0.5, borderRadius: 0.5 }}
                          >
                            {row.encoder}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>
                        No presets available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>

      

      <CreateWatcherModal
        isOpen={openWatcherModal}
        onClose={() => setOpenWatcherModal(false)}
        onCreated={handleCreate}
      />
      <CreateQueueModal
        isOpen={openQueueModal}
        onClose={() => setOpenQueueModal(false)}
        onCreated={handleCreate}
      />
      <CreatePresetModal
        isOpen={openPresetModal}
        onClose={() => setOpenPresetModal(false)}
        onCreated={handleCreate}
      />
    </div>
  );
};

export default Main;