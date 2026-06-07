const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

app.use('/categorias', require('./routes/categorias.routes'));

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
