'use strict';

const apiURL = 'https://api.lyrics.ovh';

const form = $('#form');
const search = $('#search');
const result = $('#result');
const more = $('#more');

// Search by song or artist
function searchSongs(term) {
  fetch(`${apiURL}/suggest/${term}`)
    .then(response => response.json())
    .then(data => showData(data))
    .catch((error) => {
      console.log('Error: ', error);
      $('#js-error-message').text(`Something went wrong: ${error.message}`);
    })
}

// Show song and artist in DOM
function showData(data) {
  let output = '';
  if (!data.total) {
    alert('Artist or title could not be found. Please try again.');
  } else {
    data.data.forEach(song => {
      output += `
        <li>
          <span><strong>${song.artist.name}</strong> - ${song.title}</span>
          <button id="getLyricsBtn" class="btn" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics</button>
        </li>
      `;
    });
  }

  $('#result').html(`
    <ul class="songs">
      ${output}
    </ul>
  `);

  if(data.prev || data.next) {
    $('#more').html(`
      ${data.prev ? `<button class="btn" onclick="getMoreSongs('${data.prev}')">Prev</button>` : ""}
      ${data.next ? `<button class="btn" onclick="getMoreSongs('${data.next}')">Next</button>` : ""}
    `);
  } else {
    $('#more').html('');
  }
}

// Get prev and next results
function getMoreSongs(url) {
  fetch(`https://cors-anywhere.herokuapp.com/${url}`)
    .then(response => response.json())
    .then(data => showData(data))
    .catch((error) => {
      console.log('Error: ', error);
      $('#js-error-message').text(`Something went wrong: ${error.message}`);
    })
}

// Get lyrics for song
async function getLyrics(artist, songTitle) {
  const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();
  const lyrics = data.lyrics.replaceAll(/(\r\n|\r|\n)/g, '<br>');

  $('#result').html(`
  <h2><strong>${artist}</strong> - ${songTitle}</h2>
  <span>${lyrics}</span>
  `);

  $('#more').html('');
}

// Event Listeners - 'Search' button click
function watchForm() {
  $('header').on('submit', '#form', function(event) {
    event.preventDefault();
    const searchTerm = $('#search').val().trim();
    if(!searchTerm) {
      alert('Please enter artist or song title');
    } else {
      searchSongs(searchTerm);
    }
  });
} 

// Event listeners - 'Get Lyrics' button click
$('body').on('click', '#getLyricsBtn', function(event) {
  const clickedEl = event.target;
  if(clickedEl.tagName === 'BUTTON') {
    const artist = clickedEl.getAttribute('data-artist');
    const songTitle = clickedEl.getAttribute('data-songtitle');
    getLyrics(artist, songTitle);
  }
});

// Ready call
$(watchForm)
