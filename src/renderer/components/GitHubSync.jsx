import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Octokit } from '@octokit/rest';

function GitHubSync() {
  const [token, setToken] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Load GitHub token from electron-store
    window.electron.invoke('store-get', 'github-token')
      .then((savedToken) => {
        if (savedToken) {
          setToken(savedToken);
          fetchRepositories(savedToken);
        }
      });
  }, []);

  const fetchRepositories = async (authToken) => {
    setLoading(true);
    setError(null);

    try {
      const octokit = new Octokit({ auth: authToken });
      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });

      setRepositories(data);
    } catch (err) {
      setError('Failed to fetch repositories. Please check your token.');
      console.error('GitHub API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = async () => {
    await window.electron.invoke('store-set', 'github-token', token);
    fetchRepositories(token);
    setDialogOpen(false);
  };

  const handleSync = async (repo) => {
    try {
      // Here you would implement the sync logic
      // For example, pulling latest changes or checking status
      console.log('Syncing repository:', repo.full_name);
      
      // Show notification
      window.electron.send('show-notification', {
        title: 'Repository Sync',
        body: `Successfully synced ${repo.name}`,
      });
    } catch (err) {
      setError(`Failed to sync ${repo.name}`);
      console.error('Sync Error:', err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          GitHub Sync
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchRepositories(token)}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(true)}
          >
            {token ? 'Update Token' : 'Add Token'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <List>
          {repositories.map((repo) => (
            <ListItem key={repo.id} divider>
              <ListItemText
                primary={repo.name}
                secondary={repo.description || 'No description'}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => window.open(repo.html_url)}
                  sx={{ mr: 1 }}
                >
                  <LinkIcon />
                </IconButton>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleSync(repo)}
                >
                  Sync
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>GitHub Personal Access Token</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your GitHub personal access token to enable repository synchronization.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Personal Access Token"
            type="password"
            fullWidth
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTokenSubmit} variant="contained">
            Save Token
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GitHubSync; 