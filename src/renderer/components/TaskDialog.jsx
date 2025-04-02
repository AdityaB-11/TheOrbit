import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const priorities = ['low', 'medium', 'high', 'urgent'];

export default function TaskDialog({ open, onClose, task, onSave, projects }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    projectId: '',
    deadline: null,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        projectId: task.projectId || '',
        deadline: task.deadline ? new Date(task.deadline) : null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        projectId: '',
        deadline: null,
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            autoFocus
            name="title"
            label="Title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
          />
          
          <TextField
            name="description"
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={formData.description}
            onChange={handleChange}
          />

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label="Priority"
            >
              {priorities.map(priority => (
                <MenuItem
                  key={priority}
                  value={priority}
                  sx={{
                    color: priority === 'high' ? '#ef4444' :
                           priority === 'medium' ? '#fde047' :
                           priority === 'urgent' ? '#fb923c' : '#86efac'
                  }}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Project</InputLabel>
            <Select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              label="Project"
            >
              <MenuItem value="">None</MenuItem>
              {projects.map(project => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Deadline"
              value={formData.deadline}
              onChange={(newValue) => {
                setFormData(prev => ({ ...prev, deadline: newValue }));
              }}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title.trim()}
        >
          {task ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 