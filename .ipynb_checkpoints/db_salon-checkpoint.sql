CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY, -- Unique ID for each client
    client_name VARCHAR(255) NOT NULL,
    first_visit_date DATE NOT NULL
);

CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY, -- Unique ID for each appointment
    client_id INT NOT NULL,
    service VARCHAR(100) NOT NULL,
    staff VARCHAR(100) NOT NULL,
    appointment_time TIMESTAMP NOT NULL, -- Stores both date and time
    booking_time TIMESTAMP NOT NULL, -- When the appointment was made
    status VARCHAR(50) NOT NULL, -- e.g., 'Completed', 'Cancelled', 'No-Show'
    price NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
);