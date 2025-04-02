import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Grid,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { store } from '../store';
import TaskDialog from './TaskDialog';

const priorityColors = {
  low: '#86efac',
  medium: '#fde047',
  high: '#ef4444',
  completed: '#4b5563',
  urgent: '#fb923c',
};

function TaskManager() {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: [],
  });
  const [projects, setProjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTask, setMenuTask] = useState(null);

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      setTasks(state.tasks);
      setProjects(state.projects);
    });

    return () => unsubscribe();
  }, []);

  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const taskId = result.draggableId;
    await store.moveTask(taskId, source.droppableId, destination.droppableId);
  };

  const handleAddTask = async (taskData) => {
    await store.addTask(taskData);
    window.electron.send('show-notification', {
      title: 'Task Created',
      body: `Task "${taskData.title}" has been created`,
    });
  };

  const handleEditTask = async (taskData) => {
    await store.updateTask(selectedTask.id, taskData);
    setSelectedTask(null);
    window.electron.send('show-notification', {
      title: 'Task Updated',
      body: `Task "${taskData.title}" has been updated`,
    });
  };

  const handleDeleteTask = async (taskId) => {
    await store.deleteTask(taskId);
    setMenuTask(null);
    setAnchorEl(null);
    window.electron.send('show-notification', {
      title: 'Task Deleted',
      body: 'Task has been deleted',
    });
  };

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setMenuTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTask(null);
  };

  const handleEditClick = () => {
    setSelectedTask(menuTask);
    setDialogOpen(true);
    handleMenuClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Task Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Task
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {Object.entries(tasks).map(([status, statusTasks]) => (
            <Grid item xs={12} md={4} key={status}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  minHeight: '70vh',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {status === 'todo' ? 'To Do' :
                   status === 'inProgress' ? 'In Progress' : 'Completed'}
                </Typography>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 100,
                        backgroundColor: snapshot.isDraggingOver
                          ? 'rgba(99, 102, 241, 0.1)'
                          : 'transparent',
                        transition: 'background-color 0.2s ease',
                        borderRadius: 1,
                      }}
                    >
                      {statusTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                p: 2,
                                mb: 2,
                                backgroundColor: snapshot.isDragging
                                  ? 'rgba(99, 102, 241, 0.2)'
                                  : 'background.paper',
                                boxShadow: snapshot.isDragging
                                  ? 8
                                  : 1,
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1">
                                  {task.title}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, task)}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ mb: 1 }}
                              >
                                {task.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                  label={task.priority}
                                  size="small"
                                  sx={{
                                    backgroundColor: priorityColors[task.priority],
                                    color: task.priority === 'high' ? 'white' : 'inherit',
                                  }}
                                />
                                {task.projectId && (
                                  <Chip
                                    label={projects.find(p => p.id === task.projectId)?.name}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                {task.deadline && (
                                  <Chip
                                    label={new Date(task.deadline).toLocaleDateString()}
                                    size="small"
                                    variant="outlined"
                                    color={
                                      new Date(task.deadline) < new Date()
                                        ? 'error'
                                        : 'default'
                                    }
                                  />
                                )}
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

      <TaskDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={selectedTask ? handleEditTask : handleAddTask}
        projects={projects}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteTask(menuTask.id);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default TaskManager; 