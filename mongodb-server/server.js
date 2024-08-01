const express = require('express');

const app = express();
const PORT = process.env.PORT || 7000;
app.get('/server', (req, res) => {
    res.send('Hello from mongodb-server!');
  });
app.get('/', (req, res) => {
    res.send('Hello from mongodb-server!');
  });
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });