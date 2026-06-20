const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, 'users.json');
const TASKS_FILE = path.join(__dirname, 'tasks.json');

const readJSON = (file) => {
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return [];
  }
};

const writeJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

class MockUser {
  static async findOne(query) {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => {
      if (query.email && u.email === query.email.toLowerCase()) return true;
      if (query.username && u.username === query.username) return true;
      return false;
    });
    if (!user) return null;
    return {
      ...user,
      id: user._id,
      matchPassword: async function(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      }
    };
  }

  static async findById(id) {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u._id === id.toString());
    if (!user) return null;
    return {
      ...user,
      id: user._id,
      select: function(fields) {
        if (fields.includes('-password')) {
          const { password, ...rest } = this;
          return rest;
        }
        return this;
      }
    };
  }

  static async create(data) {
    const users = readJSON(USERS_FILE);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const newUser = {
      _id: Math.random().toString(36).substr(2, 9),
      username: data.username,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    return {
      ...newUser,
      id: newUser._id
    };
  }
}

class TaskQueryChain {
  constructor(results) {
    this.results = results;
  }
  sort(sortObj) {
    const sortField = Object.keys(sortObj)[0] || 'created_at';
    const sortOrder = sortObj[sortField] || -1;
    this.results.sort((a, b) => {
      if (sortField === 'title') {
        return sortOrder === 1 ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      return sortOrder === 1 ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at);
    });
    return this;
  }
  skip(n) {
    this.results = this.results.slice(n);
    return this;
  }
  limit(n) {
    this.results = this.results.slice(0, n);
    return this;
  }
  then(resolve) {
    resolve(this.results);
  }
}

class MockTask {
  static filterTasks(query) {
    const tasks = readJSON(TASKS_FILE);
    return tasks.filter(t => {
      // User filter
      if (query.user && t.user !== query.user) return false;
      
      // Status filter
      if (query.status && query.status !== 'All' && t.status !== query.status) return false;
      
      // Search filter
      if (query.$or) {
        const titleRegex = new RegExp(query.$or[0].title.$regex, 'i');
        const descRegex = new RegExp(query.$or[1].description.$regex, 'i');
        return titleRegex.test(t.title) || descRegex.test(t.description);
      }
      return true;
    });
  }

  static async find(query) {
    const filtered = this.filterTasks(query);
    return new TaskQueryChain(filtered);
  }

  static async countDocuments(query) {
    const filtered = this.filterTasks(query);
    return filtered.length;
  }

  static async create(data) {
    const tasks = readJSON(TASKS_FILE);
    const newTask = {
      _id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      description: data.description,
      status: data.status || 'Pending',
      user: data.user.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    tasks.push(newTask);
    writeJSON(TASKS_FILE, tasks);
    return {
      ...newTask,
      id: newTask._id
    };
  }

  static async findById(id) {
    const tasks = readJSON(TASKS_FILE);
    const task = tasks.find(t => t._id === id.toString());
    if (!task) return null;
    return {
      ...task,
      id: task._id,
      save: async function() {
        const allTasks = readJSON(TASKS_FILE);
        const idx = allTasks.findIndex(t => t._id === this._id);
        if (idx !== -1) {
          allTasks[idx] = {
            _id: this._id,
            title: this.title,
            description: this.description,
            status: this.status,
            user: this.user,
            created_at: this.created_at,
            updated_at: new Date().toISOString()
          };
          writeJSON(TASKS_FILE, allTasks);
        }
        return this;
      },
      deleteOne: async function() {
        const allTasks = readJSON(TASKS_FILE);
        const filtered = allTasks.filter(t => t._id !== this._id);
        writeJSON(TASKS_FILE, filtered);
        return { deletedCount: 1 };
      }
    };
  }
}

module.exports = {
  MockUser,
  MockTask
};
