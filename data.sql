DROP DATABASE IF EXISTS jobly;

CREATE DATABASE jobly;

\c jobly

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  num_employees INTEGER,
  description TEXT, 
  logo_url TEXT
);


CREATE TABLE jobs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      salary FLOAT NOT NULL,
      equity FLOAT NOT NULL CHECK (equity <= 1.0),
      company_handle TEXT NOT NULL REFERENCES companies(handle) ON DELETE CASCADE,
      date_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE users (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      photo_url TEXT,
      is_admin BOOLEAN default FALSE
  );

INSERT INTO companies(handle, name, num_employees) VALUES
    ('apple', 'apple inc', 1000),
    ('nike', 'nike inc', 200),
    ('rithm', 'rithm school', 10),
    ('starbucks', 'starbucks inc', 500);

  INSERT INTO jobs(title, salary, company_handle, equity) VALUES
    ('engineer', 100000, 'apple', 0.5),
    ('plumber', 120000, 'apple',0.5),
    ('barista', 200000, 'nike', 0.5);
