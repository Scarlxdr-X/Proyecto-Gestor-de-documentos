const conexion = require('./conexion')

const crearTablas = () => {
  const usuarios = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      contraseña VARCHAR(255),
      rol ENUM('admin', 'usuario') DEFAULT 'usuario'
    )
  `

  const eventos = `
    CREATE TABLE IF NOT EXISTS eventos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(150),
      descripcion TEXT,
      fecha DATETIME,
      lugar VARCHAR(150),
      precio DECIMAL(10,2),
      stock_total INT,
      stock_disponible INT,
      imagen VARCHAR(255)
    )
  `

  const entradas = `
    CREATE TABLE IF NOT EXISTS entradas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT,
      evento_id INT,
      codigo_qr VARCHAR(255),
      fecha_compra DATETIME DEFAULT NOW(),
      estado ENUM('valida', 'usada') DEFAULT 'valida',
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (evento_id) REFERENCES eventos(id)
    )
  `

  conexion.query(usuarios, (error) => {
    if (error) return console.log('Error creando tabla usuarios:', error)
    console.log('Tabla usuarios lista')
  })

  conexion.query(eventos, (error) => {
    if (error) return console.log('Error creando tabla eventos:', error)
    console.log('Tabla eventos lista')
  })

  conexion.query(entradas, (error) => {
    if (error) return console.log('Error creando tabla entradas:', error)
    console.log('Tabla entradas lista')
  })
}

module.exports = crearTablas