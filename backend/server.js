// CODE FOR: Node.js (replace your entire server.js file)
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const { PythonShell } = require('python-shell');

const app = express();
const PORT = 3000;

// --- IMPORTANT: REPLACE WITH YOUR DATABASE CREDENTIALS ---
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'salon_db',
  password: 'Your_Secret_Password_Here',
  port: 5432,
});
// ---------------------------------------------------------

app.use(express.json());
// This line tells Express to serve static files from the PARENT directory
app.use(express.static(path.join(__dirname, '..')));

// --- API Endpoints ---

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.appointment_id, c.client_name, a.service, a.staff, a.appointment_time
       FROM appointments a
       JOIN clients c ON a.client_id = c.client_id
       ORDER BY a.appointment_time DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get all clients
app.get('/api/clients', async (req, res) => {
    try {
        const result = await pool.query('SELECT client_id, client_name FROM clients ORDER BY client_name;');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Create a new appointment
app.post('/api/appointments', async (req, res) => {
  const { clientId, service, date, time, staff } = req.body;

  if (!clientId || !service || !date || !time || !staff) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const appointment_time = `${date} ${time}`;
    const price = 1000; // Placeholder price

    const newAppointment = await pool.query(
      `INSERT INTO appointments (client_id, service, staff, appointment_time, booking_time, status, price)
       VALUES ($1, $2, $3, $4, NOW(), 'Booked', $5)
       RETURNING *;`,
      [clientId, service, staff, appointment_time, price]
    );

    res.status(201).json(newAppointment.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ** NEW ENDPOINT FOR PREDICTION **
app.post('/api/predict', async (req, res) => {
    const { client_id, appointment_time, price } = req.body;
    
    // 1. Get client history from the database
    const historyResult = await pool.query(
        `SELECT 
            COUNT(*) as previous_appointments,
            COUNT(CASE WHEN status = 'No-Show' THEN 1 END) as previous_no_shows
         FROM appointments 
         WHERE client_id = $1 AND appointment_time < $2`,
        [client_id, appointment_time]
    );

    const history = historyResult.rows[0];
    const no_show_rate = (history.previous_appointments > 0) ? (history.previous_no_shows / history.previous_appointments) : 0;
    
    // 2. Prepare data for the Python script
    const lead_time_days = Math.round((new Date(appointment_time) - new Date()) / (1000 * 60 * 60 * 24));

    const predictionInput = {
        lead_time_days: lead_time_days,
        previous_appointments: parseInt(history.previous_appointments),
        no_show_rate: no_show_rate,
        price: price,
        appointment_time: appointment_time
    };

    // 3. Run Python script
    const options = {
        mode: 'text',
        pythonOptions: ['-u'], // unbuffered stdout
        scriptPath: __dirname, // The 'backend' folder
        args: [JSON.stringify(predictionInput)]
    };

    PythonShell.run('predict.py', options).then(messages => {
        res.json({ prediction: messages[0] });
    }).catch(err => {
        console.error(err);
        res.status(500).send('Prediction failed');
    });
});


// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});