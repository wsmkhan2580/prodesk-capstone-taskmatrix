const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const fileRoutes = require('./routes/fileRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
    res.send('TaskMatrix API is running');
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));