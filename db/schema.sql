CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50),
  precio_uf DECIMAL(10,2),
  superficie VARCHAR(50),
  ubicacion VARCHAR(255),
  region VARCHAR(100),
  comuna VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'disponible',
  fotos TEXT[],
  video_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  mensaje TEXT,
  tipo_formulario VARCHAR(50),
  propiedad_id INTEGER REFERENCES properties(id),
  estado VARCHAR(50) DEFAULT 'nuevo',
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP,
  consent_ip VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
