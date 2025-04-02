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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const priorityColors = {
  low: '#86efac',
  medium: '#fde047',
  high: '#ef4444',
  completed: '#4b5563',
  urgent: '#fb923c',
};

const columns = {
  todo: {
    id: 'todo',
    title: 'To Do',
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
  },
  completed: {
    id: 'completed',
    title: 'Completed',
  },
};

function TaskManager() {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: [],
  });

  useEffect(() => {
    // Load tasks from electron-store
    window.electron.invoke('store-get', 'tasks')
      .then((savedTasks) => {
        if (savedTasks) {
          setTasks(savedTasks);
        }
      });
  }, []);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];
    const sourceTasks = Array.from(sourceColumn);
    const destTasks = source.droppableId === destination.droppableId
      ? sourceTasks
      : Array.from(destColumn);

    const [removed] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, removed);

    const newTasks = {
      ...tasks,
      [source.droppableId]: sourceTasks,
      [destination.droppableId]: destTasks,
    };

    setTasks(newTasks);
    window.electron.invoke('store-set', 'tasks', newTasks);
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
          sx={{ borderRadius: 2 }}
        >
          Add Task
        </Button>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={3}>
          {Object.values(columns).map((column) => (
            <Grid item xs={12} md={4} key={column.id}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  minHeight: '70vh',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {column.title}
                </Typography>
                <Droppable droppableId={column.id}>
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
                      {tasks[column.id].map((task, index) => (
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
                                <Box>
                                  <IconButton size="small">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error">
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
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
                                {task.project && (
                                  <Chip
                                    label={task.project}
                                    size="small"
                                    variant="outlined"
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
    </Box>
  );
}

export default TaskManager; 