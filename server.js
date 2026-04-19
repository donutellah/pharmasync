require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.use('/api/products', require('./routes/products'));

app.use('/api/suppliers', require('./routes/suppliers'));

app.use('/api/sales', require('./routes/sales'));

app.use('/api/reports', require('./routes/reports'));

app.use('/api/users', require('./routes/users'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/ai', require('./routes/ai'));
app.get('/', (req, res) => {
  res.json({ message: 'PharmaSync API is running.' });
});

app.listen(PORT, () => {
  console.log(`PharmaSync server running on port ${PORT}`);
});
