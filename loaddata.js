const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // replace with your MySQL user
  password: 'admin', // replace with your MySQL password
  database: 'zomato'
});

const filePath = path.join(__dirname, 'zomato_data.csv');

const loadData = () => {
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      process.exit(1);
    }
    console.log('Connected to MySQL');

    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({
        separator: ',', // CSV delimiter
        headers: [
          'id', 'name', 'country_code', 'city', 'address', 
          'locality', 'locality_verbose', 'longitude', 'latitude', 
          'cuisines', 'average_cost_for_two', 'currency', 
          'has_table_booking', 'has_online_delivery', 'is_delivering_now', 
          'switch_to_order_menu', 'price_range', 'aggregate_rating', 
          'rating_color', 'rating_text', 'votes'
        ],
        skipLines: 1 // Skip header line
      }))
      .on('data', (row) => {
        // Check and log currency length
        if (row.currency.length > 50) {
          console.log(`Long currency value detected: ${row.currency}`);
        }
        results.push(row);
      })
      .on('end', () => {
        console.log('CSV file successfully processed');

        // Transform data into an array of values for SQL insert
        const sql = `INSERT INTO restaurants (
          id, name, country_code, city, address, locality, locality_verbose, 
          longitude, latitude, cuisines, average_cost_for_two, currency, 
          has_table_booking, has_online_delivery, is_delivering_now, 
          switch_to_order_menu, price_range, aggregate_rating, rating_color, 
          rating_text, votes
        ) VALUES ?`;

        const values = results.map(item => [
          item.id, item.name, item.country_code, item.city, item.address, 
          item.locality, item.locality_verbose, item.longitude, item.latitude, 
          item.cuisines, item.average_cost_for_two, item.currency.slice(0, 50), // Truncate to 50 characters
          item.has_table_booking === '1', item.has_online_delivery === '1', 
          item.is_delivering_now === '1', item.switch_to_order_menu === '1', 
          item.price_range, item.aggregate_rating, item.rating_color, 
          item.rating_text, item.votes
        ]);

        db.query(sql, [values], (err, results) => {
          if (err) {
            console.error('Failed to load data:', err);
          } else {
            console.log('Data loaded successfully');
          }
          db.end();
        });
      });
  });
};

loadData();
