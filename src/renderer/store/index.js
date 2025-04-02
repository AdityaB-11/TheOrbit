const generateId = () => Math.random().toString(36).substr(2, 9);

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = {
      projects: [],
      tasks: {
        todo: [],
        inProgress: [],
        completed: []
      }
    };
    this.loadInitialState();
  }

  async loadInitialState() {
    try {
      const projects = await window.electron.invoke('store-get', 'projects') || [];
      const tasks = await window.electron.invoke('store-get', 'tasks') || {
        todo: [],
        inProgress: [],
        completed: []
      };
      this.state = { projects, tasks };
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load initial state:', error);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  async saveState() {
    try {
      await window.electron.invoke('store-set', 'projects', this.state.projects);
      await window.electron.invoke('store-set', 'tasks', this.state.tasks);
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  // Project Methods
  async addProject(project) {
    const newProject = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
      status: 'in_progress',
      ...project
    };
    this.state.projects = [...this.state.projects, newProject];
    await this.saveState();
    this.notifyListeners();
    return newProject;
  }

  async updateProject(projectId, updates) {
    this.state.projects = this.state.projects.map(project =>
      project.id === projectId
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    );
    await this.saveState();
    this.notifyListeners();
  }

  async deleteProject(projectId) {
    this.state.projects = this.state.projects.filter(project => project.id !== projectId);
    await this.saveState();
    this.notifyListeners();
  }

  // Task Methods
  async addTask(task) {
    const newTask = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'todo',
      ...task
    };
    this.state.tasks.todo = [...this.state.tasks.todo, newTask];
    await this.saveState();
    this.notifyListeners();
    return newTask;
  }

  async updateTask(taskId, updates) {
    Object.keys(this.state.tasks).forEach(status => {
      this.state.tasks[status] = this.state.tasks[status].map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      );
    });
    await this.saveState();
    this.notifyListeners();
  }

  async moveTask(taskId, fromStatus, toStatus) {
    const task = this.state.tasks[fromStatus].find(t => t.id === taskId);
    if (!task) return;

    this.state.tasks[fromStatus] = this.state.tasks[fromStatus].filter(t => t.id !== taskId);
    this.state.tasks[toStatus] = [...this.state.tasks[toStatus], { ...task, status: toStatus }];
    await this.saveState();
    this.notifyListeners();
  }

  async deleteTask(taskId) {
    Object.keys(this.state.tasks).forEach(status => {
      this.state.tasks[status] = this.state.tasks[status].filter(task => task.id !== taskId);
    });
    await this.saveState();
    this.notifyListeners();
  }
}

export const store = new Store(); 