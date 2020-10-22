'use strict';

const youTubeApiKey = 'AIzaSyBx_rabkzza_Y5NysCw4Td1j0R9iVMGkGE';
const lyricsApiURL = 'https://api.lyrics.ovh';
const youTubeApiURL = 'https://www.googleapis.com/youtube/v3/search';

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
      console.log('Error (line 18): ', error);
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
      console.log('Error (line 61): ', error);
      $('#js-error-message').text(`Something went wrong: ${error.message}`);
    })
}

// Get lyrics for song

/* async function getLyrics(artist, songTitle) {
  const res = await fetch(`${lyricsApiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();
  const lyrics = data.lyrics.replaceAll(/(\r\n|\r|\n)/g, '<br>'); */

function getLyrics(artist, songTitle) {
  fetch(`${lyricsApiURL}/v1/${artist}/${songTitle}`)
  .then(res => res.json())
  .then(data => {
    let lyrics = data.lyrics.replaceAll(/(\r\n|\r|\n)/g, '<br>');

    $('#result').html(`
    <button id='backBtn' class='btn'>Back</button>
    <h2><strong>${artist}</strong> - ${songTitle}</h2>
    <span>${lyrics}</span>
    `);
  })

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
  let id = '';
  for (let i = 0; i < maxResults; i++) {
    id = responseJson.items[i].id.videoId;
  };

  let video = `<iframe id="ytplayer" type="text/html" class="container"
  src="https://www.youtube.com/embed/${id}?autoplay=1"
  frameborder="0"></iframe>`;

  // Autoplay not allowed on mobile devices due to unsolicited data usage

  $('#displayYouTube').html(video);
}  

function getYouTubeVideos(youTubeArtist, youTubeSongTitle, maxResults=1) {
  const params = {
    part: 'snippet',
    maxResults,
    q: youTubeArtist + ' ' + youTubeSongTitle,
    type: 'video',
    key: youTubeApiKey,    
  };

  const queryString = formatQueryParams(params)
  const url = youTubeApiURL + '?' + queryString;
  
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => getYouTubeResults(responseJson, maxResults))
    .catch(err => {
      console.log('Error (line 127): ', err);
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

// Event Listener - 'Search' button click
function watchForm() {
  $('header').on('submit', '#form', function(event) {
    event.preventDefault();
    const searchTerm = $('#search').val().trim();
    if(!searchTerm) {
      alert('Please enter artist or song title');
    } /*else if('#displayYouTube') {
      $('#displayYouTube').remove();
    }*/ else {
      searchSongs(searchTerm);
    }
  });
} 

// Event listener - 'Get Lyrics' button click
$('body').on('click', '#getLyricsBtn', function(event) {
  const clickedEl = event.target;
  if(clickedEl.tagName === 'BUTTON') {
    const artist = clickedEl.getAttribute('data-artist');
    const songTitle = clickedEl.getAttribute('data-songtitle');
    const youTubeArtist = clickedEl.getAttribute('data-artist');
    const youTubeSongTitle = clickedEl.getAttribute('data-songtitle');
    getLyrics(artist, songTitle);
    getYouTubeVideos(youTubeArtist, youTubeSongTitle);
  }
});

// Event listener - 'Back' button click
//$('body').on('click', '#backBtn', function(event) {})


// Ready call
$(watchForm)
