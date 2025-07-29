const express = require('express');
const cors = require('cors');
const { sequelize, Income, Expense, User } = require('./models');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// Middleware
app.use(cors({ origin: true })); // allow all origins for development
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve the main HTML files for pretty URLs
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Demo user
let user = { id: 1, name: 'Darsh' };

// Sync database
sequelize.sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

// Routes

// User profile
app.get('/api/user/profile', (req, res) => {
  res.json(user);
});

// Get incomes
app.get('/api/income', async (req, res) => {
  try {
    const incomes = await Income.findAll({ order: [['date', 'DESC']] });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

// Add income
app.post('/api/income', async (req, res) => {
  try {
    const { source, amount, user, date } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!source || isNaN(parsedAmount) || !user) {
      return res.status(400).json({ error: 'Source, user, and numeric amount are required.' });
    }

    const income = await Income.create({
      user,
      source,
      amount: parsedAmount,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create income' });
  }
});

// Delete income
app.delete('/api/income/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { user } = req.body;
    
    // Find the income transaction
    const income = await Income.findByPk(id);
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    
    // Check if the user is authorized to delete this transaction
    if (income.user !== user) {
      return res.status(403).json({ error: 'You can only delete your own transactions' });
    }
    
    // Delete the transaction
    await income.destroy();
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

// Get expenses
app.get('/api/expense', async (req, res) => {
  try {
    const expenses = await Expense.findAll({ order: [['date', 'DESC']] });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Add expense
app.post('/api/expense', async (req, res) => {
  try {
    const { source, amount, user, date } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!source || isNaN(parsedAmount) || !user) {
      return res.status(400).json({ error: 'Source, user, and numeric amount are required.' });
    }

    const expense = await Expense.create({
      user,
      source,
      amount: parsedAmount,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Delete expense
app.delete('/api/expense/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { user } = req.body;
    
    // Find the expense transaction
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    // Check if the user is authorized to delete this transaction
    if (expense.user !== user) {
      return res.status(403).json({ error: 'You can only delete your own transactions' });
    }
    
    // Delete the transaction
    await expense.destroy();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// --- SIGNUP ---
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
