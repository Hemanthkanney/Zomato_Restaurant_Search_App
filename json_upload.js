// extractImages.js
const fs = require('fs');
const path = require('path');

const filePaths = [
  'file1.json',
  'file2.json',
  'file3.json',
  'file4.json',
  'file5.json'
];

const extractImageUrls = async () => {
  const imageUrls = [];
  try {
    for (const filePath of filePaths) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      data.forEach(item => {
        if (item.restaurants) {
          item.restaurants.forEach(restaurant => {
            if (restaurant.restaurant && restaurant.restaurant.featured_image) {
              imageUrls.push({
                id: restaurant.restaurant.R.res_id, // Use res_id or any unique identifier
                imageUrl: restaurant.restaurant.featured_image
              });
            }
          });
        }
      });
    }
    // Save image URLs to a file or database as needed
    fs.writeFileSync('imageUrls.json', JSON.stringify(imageUrls, null, 2));
    console.log('Image URLs extracted and saved.');
  } catch (error) {
    console.error('Error extracting image URLs:', error);
  }
};

extractImageUrls();
