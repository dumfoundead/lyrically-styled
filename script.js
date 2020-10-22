'use strict';

const youTubeApiKey = 'AIzaSyBHJsYZwa3nILNreY3v7LN2gCuBlfX_WeY';
const lyricsApiURL = 'https://api.lyrics.ovh';
const youTubeApiURL = 'https://www.googleapis.com/youtube/v3';

const form = $('#form');
const search = $('#search');
const result = $('#result');
const more = $('#more');

// Search by song or artist
function searchSongs(term) {
  fetch(`${lyricsApiURL}/suggest/${term}`)
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
  const res = await fetch(`${lyricsApiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();
  const lyrics = data.lyrics.replaceAll(/(\r\n|\r|\n)/g, '<br>');

  $('#result').html(`
  <button id='backBtn' class='btn'>Back</button>
  <h2><strong>${artist}</strong> - ${songTitle}</h2>
  <span><a href='${link}' target='_blank'>${thumbnail}</a></span>
  <span>${lyrics}</span>
  `);

  $('#more').html('');
}

// Format parameters for YouTube
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

// Display results for YouTube
function getYouTubeResults(responseJson, maxResults) {
  for (let i = 0; i < maxResults; i++){
    const link = `https://www.youtube.com/watch?v=${responseJson.items[i].id.videoId}`;
    const thumbnail = `<img src='${responseJson.items[i].snippet.thumbnails.default.url}'>`;
  };
}

function getYouTubeVideos(artist, songTitle, maxResults=1) {
  const params = {
    key: youTubeApiKey,
    q: artist+songTitle,
    part: 'snippet',
    maxResults,
    type: 'video'
  };

  const queryString = formatQueryParams(params)
  const url = youTubeApiURL + '?' + queryString;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => getYouTubeResults(responseJson, maxResults))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
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
    getYouTubeVideos(artist, songTitle);
  }
});

// Ready call
$(watchForm)
