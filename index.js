const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./src/routes/routes');
const connectDB = require('./src/database/db');

connectDB();

app.get('/', (req, res) => {
    res.send('Hello World!');}
);
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({ origin: "*" }));

app.use('/api', routes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

modules.exports = app;