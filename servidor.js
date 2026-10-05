const express = require('express');
const mysql = require('mysql2/promise');

const app = express();

const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'localhost',
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'login_backend',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());
app.use(express.static(__dirname));

async function prepararBaseDeDatos() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        username VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL
      )
    `);

    const [usuarios] = await pool.execute(
      'SELECT username FROM usuarios LIMIT 1'
    );

    if (usuarios.length === 0) {
      await pool.execute(`
        INSERT INTO usuarios (username, password)
        VALUES
        ('usuario1', '12345'),
        ('estudiante', '2026'),
        ('admin', 'admin123')
      `);
    }

    console.log('Base de datos preparada correctamente.');
  } catch (error) {
    console.error('Error preparando la base de datos:', error.message);
  }
}

app.get('/estado', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();

    res.json({
      estado: 'OK',
      mensaje: 'Backend y MySQL están conectados.'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      estado: 'ERROR',
      mensaje: 'No se pudo conectar con MySQL.'
    });
  }
});

app.post('/login', async (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      mensaje: 'Usuario y contraseña son obligatorios.'
    });
  }

  try {

    const [rows] = await pool.execute(
      `SELECT username
       FROM usuarios
       WHERE username = ? AND password = ?
       LIMIT 1`,
      [username, password]
    );

    if (rows.length === 1) {

      return res.status(200).json({
        mensaje: 'Inicio de sesión exitoso'
      });

    }

    return res.status(401).json({
      mensaje: 'Inicio de sesión fallido. Verifica tus credenciales.'
    });

  } catch (error) {

    console.error('Error en la consulta:', error);

    return res.status(500).json({
      mensaje: 'Error interno del servidor.'
    });

  }
});

app.listen(PORT, async () => {

  console.log(`Servidor ejecutándose en el puerto ${PORT}`);

  await prepararBaseDeDatos();

});
