document.getElementById('search-button').addEventListener('click', () => {
  const query = document.getElementById('search-bar').value;
  const city = document.getElementById('filter-city').value;
  const cuisine = document.getElementById('filter-cuisine').value;

  fetch(`http://localhost:3000/api/restaurants/search?query=${encodeURIComponent(query)}&page=1&limit=10`)
    .then(response => response.json())
    .then(data => {
      const tableBody = document.querySelector('#restaurant-table tbody');
      tableBody.innerHTML = ''; // Clear previous results
      data.forEach(restaurant => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${restaurant.id}</td>
          <td>${restaurant.name}</td>
          <td>${restaurant.city}</td>
          <td><a href="restaurant.html?id=${restaurant.id}">View Details</a></td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch(error => console.error('Error fetching data:', error));
});
