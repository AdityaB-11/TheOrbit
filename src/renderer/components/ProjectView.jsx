import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';

function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load project data from electron-store
    window.electron.invoke('store-get', 'projects')
      .then((projects) => {
        const currentProject = projects?.find((p) => p.id === id);
        setProject(currentProject || null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Project not found</Typography>
      </Box>
    );
  }

  const getProjectProgress = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(task => task.status === 'completed').length;
    return (completed / project.tasks.length) * 100;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            {project.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {project.type}
          </Typography>
        </Box>
        <Box>
          <IconButton sx={{ mr: 1 }}>
            <EditIcon />
          </IconButton>
          <IconButton color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={getProjectProgress()}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {Math.round(getProjectProgress())}%
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Tasks
              </Typography>
              <Button startIcon={<AddIcon />} variant="contained">
                Add Task
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              {project.tasks?.map((task) => (
                <Card key={task.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.priority}
                        size="small"
                        color={
                          task.priority === 'high' ? 'error' :
                          task.priority === 'medium' ? 'warning' : 'success'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {task.description}
                    </Typography>
                    {task.deadline && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              GitHub Repository
            </Typography>
            {project.githubRepo ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GitHubIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {project.githubRepo}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => window.open(`https://github.com/${project.githubRepo}`)}
                >
                  View Repository
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GitHubIcon />}
              >
                Link Repository
              </Button>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Created
              </Typography>
              <Typography variant="body2" gutterBottom>
                {new Date(project.createdAt).toLocaleDateString()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="textSecondary">
                Last Updated
              </Typography>
              <Typography variant="body2" gutterBottom>
                {new Date(project.updatedAt).toLocaleDateString()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Chip
                label={project.status}
                size="small"
                color={
                  project.status === 'completed' ? 'success' :
                  project.status === 'in_progress' ? 'primary' : 'default'
                }
                sx={{ mt: 1 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProjectView; 