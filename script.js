'use strict';

const youTubeApiKey = 'AIzaSyAwhhhn25sGKdmgU-onzXDldKo7w63fwgg';
const lyricsApiURL = 'https://api.lyrics.ovh';
const youTubeApiURL = 'https://www.googleapis.com/youtube/v3/search';

const form = $('#form');
const search = $('#search');
const result = $('#result');
const more = $('#more');

let currentData;

// Search by song or artist
function searchSongs(term) {
  fetch(`${lyricsApiURL}/suggest/${term}`)
    .then(response => response.json())
    .then(data => {
      currentData = data;
      showData(data);  
    })
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
          <button class="btn" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics</button>
        </li>
      `;
    });
  }

  $('#result').html(`
    <ul id="getLyricsBtn" class="songs">
      ${output}
    </ul>
  `);

  if(data.prev || data.next) {
    console.log(`${data.next}`)
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
  fetch(`${url}`)
  .then(response => response.json())
  .then(data => {
    currentData = data;
    showData(data);
  })
  .catch((error) => {
    console.log('Error: ', `${error.message}`);
  });
}

// Get lyrics for song
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
  .catch((error) => {
    console.log('Error: ', `${error.message}`);
  });

  $('#more').html('');
}

// Format parameters for YouTube
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

// Display YouTube video from fetched data
function getYouTubeResults(responseJson, maxResults) {
  let id = '';
  for (let i = 0; i < maxResults; i++) {
    id = responseJson.items[i].id.videoId;
  };

  let video = `<iframe id="ytplayer" type="text/html" class="container"
  src="https://www.youtube.com/embed/${id}?autoplay=1" allow="autoplay" allowfullscreen="allowfullscreen"
  frameborder="0" width="480" height="270"></iframe>`; 
  
  //Autoplay disallowed on mobile devices to prevent unsolicited data usage
  
  $('#displayYouTube').html(video);
}  

// Fetch YouTube data 
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
  .catch(error => {
    console.log('Error: ', `${error.message}`);
  });
}

// Event Listener - 'Search' button click
function watchForm() {
  $('header').on('submit', '#form', function(event) {
    event.preventDefault();
    const searchTerm = $('#search').val().trim();
    if(!searchTerm) {
      alert('Please enter artist or song title');
    } else {
      $('#displayYouTube').empty();
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
$('body').on('click', '#backBtn', function(event) {
  showData(currentData);
  $('#displayYouTube').empty();
});

// Ready call
$(watchForm)
