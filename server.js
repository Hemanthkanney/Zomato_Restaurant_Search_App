const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'zomato'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Load image URLs from JSON file
const imageUrlsPath = path.join(__dirname, 'imageUrls.json');
let imageUrls = [];

if (fs.existsSync(imageUrlsPath)) {
  imageUrls = JSON.parse(fs.readFileSync(imageUrlsPath, 'utf8'));
}

// Function to get image URL by restaurant ID
const getImageUrlById = (id) => {
  const image = imageUrls.find(img => img.id === id);
  return image ? image.imageUrl : 'default-image-url'; // Replace with a default image URL
};

// API endpoint to get restaurant by ID
app.get('/api/restaurant/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM restaurants WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      const restaurant = results[0];
      restaurant.featured_image = getImageUrlById(restaurant.id);
      return res.json(restaurant);
    }
    return res.status(404).json({ error: 'Restaurant not found' });
  });
});

// API endpoint to search for restaurants
app.get('/api/restaurants/search', (req, res) => {
  const { query = '', page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const searchQuery = `%${query}%`;

  db.query(
    'SELECT * FROM restaurants WHERE name LIKE ? OR city LIKE ? LIMIT ? OFFSET ?',
    [searchQuery, searchQuery, parseInt(limit), parseInt(offset)],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      const restaurants = results.map(restaurant => {
        restaurant.featured_image = getImageUrlById(restaurant.id);
        return restaurant;
      });
      res.json(restaurants);
    }
  );
});

// API endpoint to get a list of restaurants with filtering
app.get('/api/restaurants', (req, res) => {
  const { page = 1, limit = 10, city, cuisine } = req.query;
  const offset = (page - 1) * limit;
  const filters = [];
  const params = [];

  let sql = 'SELECT * FROM restaurants';

  if (city) {
    filters.push('city = ?');
    params.push(city);
  }

  if (cuisine) {
    filters.push('cuisines LIKE ?');
    params.push(`%${cuisine}%`);
  }

  if (filters.length > 0) {
    sql += ' WHERE ' + filters.join(' AND ');
  }

  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const restaurants = results.map(restaurant => {
      restaurant.featured_image = getImageUrlById(restaurant.id);
      return restaurant;
    });
    res.json(restaurants);
  });
});

// Route to render the index page
app.get('/', (req, res) => {
  db.query('SELECT * FROM restaurants LIMIT 10', (err, results) => {
    if (err) return res.status(500).send('Error retrieving restaurants');
    const restaurants = results.map(restaurant => {
      restaurant.featured_image = getImageUrlById(restaurant.id);
      return restaurant;
    });
    res.render('index', { restaurants, page: 1 });
  });
});

// Route to render the restaurant details page
app.get('/restaurant', (req, res) => {
  const { id } = req.query;
  db.query('SELECT * FROM restaurants WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send('Error retrieving restaurant details');
    if (results.length > 0) {
      const restaurant = results[0];
      restaurant.featured_image = getImageUrlById(restaurant.id);
      res.render('restaurant', { restaurant });
    } else {
      res.status(404).send('Restaurant not found');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
