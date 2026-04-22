const express = require('express');
const app = express();
const cors = require('cors');

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({ origin: "*" }));


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});