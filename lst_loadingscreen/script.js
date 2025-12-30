// KONFIGURACE
const Config = {
    serverName: "Last Scripts",
    serverSubtitle: "Nejlepší scripty na světě",
    // Pozadí lokální soubor ( 'img/pozadi.jpg')
    // Pokud používáš lokální soubor, vlož ho do složky 'img'
    backgroundImage: "test.jpg", 

    // Hudba: Zde přidej názvy souborů z 'music'
    music: [
        { type: 'local', file: 'music/end.mp3', title: 'End Of Beginning', artist: 'Djo' },
        { type: 'local', file: 'music/song.mp3', title: 'NAVŽDYCKY BLÁZEN', artist: 'Unknown' }
    ],

    changelog: [
        {
            date: "29.12.2025",
            title: "Update 2.0",
            items: [
                "Přidán nový loading screen",
                "Upraveno rádio",
                "Optimalizace scriptů",
                "Menší UI opravy"
            ]
        },
        {
            date: "20.12.2025",
            title: "Vánoční Update",
            items: [
                "Sníh na celé mapě",
                "Vánoční stromek na náměstí",
                "Dárky pro hráče"
            ]
        }
    ]
};

let ytPlayer;
let isYoutubeReady = false;
let currentTrackIndex = 0;
let isPlaying = false;
let currentVolume = 20;

document.addEventListener('DOMContentLoaded', () => {
    setupContent();
    setupMusic();
    renderChangelog();
    
    const toggleBtn = document.getElementById('changelog-toggle');
    const changelogBox = document.getElementById('changelog-box');
    
    if (toggleBtn && changelogBox) {
        toggleBtn.addEventListener('click', () => {
            changelogBox.classList.toggle('minimized');
        });
    }
});

function setupContent() {
    document.getElementById('server-name').innerText = Config.serverName;
    document.getElementById('server-subtitle').innerText = Config.serverSubtitle;
    if (Config.backgroundImage) {
        document.body.style.backgroundImage = `url('${Config.backgroundImage}')`;
    }
}

function renderChangelog() {
    const container = document.getElementById('changelog-content');
    container.innerHTML = '';

    Config.changelog.forEach(update => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'update-item';
        
        let listHtml = '<ul class="update-list">';
        update.items.forEach(li => {
            listHtml += `<li>${li}</li>`;
        });
        listHtml += '</ul>';

        itemDiv.innerHTML = `
            <div class="update-date">${update.date}</div>
            <div class="update-title">${update.title}</div>
            ${listHtml}
        `;
        container.appendChild(itemDiv);
    });
}


function setupMusic() {
    window.audioPlayer = new Audio();
    window.audioPlayer.volume = currentVolume / 100;

    document.getElementById('play-pause-btn').addEventListener('click', togglePlay);
    document.getElementById('next-btn').addEventListener('click', nextTrack);
    document.getElementById('prev-btn').addEventListener('click', prevTrack);
    
    document.getElementById('volume-slider').addEventListener('input', (e) => {
        currentVolume = e.target.value;
        window.audioPlayer.volume = currentVolume / 100;
        if (isYoutubeReady && ytPlayer) {
            ytPlayer.setVolume(currentVolume);
        }
    });

    window.audioPlayer.addEventListener('ended', nextTrack);

    setTimeout(() => {
        loadTrack(0);
        document.body.click();
    }, 1500);
}

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    isYoutubeReady = true;
    ytPlayer.setVolume(currentVolume);
    const track = Config.music[currentTrackIndex];
    if (track.type === 'youtube' && isPlaying) {
        ytPlayer.loadVideoById(track.id);
        ytPlayer.playVideo();
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        nextTrack();
    }
}

function loadTrack(index) {
    stopAll();

    if (index >= Config.music.length) index = 0;
    if (index < 0) index = Config.music.length - 1;

    currentTrackIndex = index;
    const track = Config.music[index];

    document.getElementById('track-title').innerText = track.title;
    document.getElementById('track-artist').innerText = track.artist;

    if (track.type === 'youtube') {
        if (isYoutubeReady && ytPlayer) {
            ytPlayer.loadVideoById(track.id);
            ytPlayer.playVideo();
        } else {
        }
    } else {
        window.audioPlayer.src = track.file;
        window.audioPlayer.currentTime = 0;
        window.audioPlayer.volume = currentVolume / 100;
        
        var playPromise = window.audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                console.log("Audio playing");
            }).catch(error => {
                console.log("Autoplay blocked, waiting for interaction", error);
            });
        }
    }

    isPlaying = true;
    updatePlayIcon();
}

function stopAll() {
    window.audioPlayer.pause();
    window.audioPlayer.currentTime = 0;
    if (isYoutubeReady && ytPlayer && typeof ytPlayer.stopVideo === 'function') {
        ytPlayer.stopVideo();
    }
}

function togglePlay() {
    if (isPlaying) {
        if (Config.music[currentTrackIndex].type === 'youtube') {
            if (ytPlayer) ytPlayer.pauseVideo();
        } else {
            window.audioPlayer.pause();
        }
        isPlaying = false;
    } else {
        if (Config.music[currentTrackIndex].type === 'youtube') {
            if (ytPlayer) ytPlayer.playVideo();
        } else {
            window.audioPlayer.play();
        }
        isPlaying = true;
    }
    updatePlayIcon();
}

function updatePlayIcon() {
    const icon = document.querySelector('#play-pause-btn i');
    if (isPlaying) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

function nextTrack() { loadTrack(currentTrackIndex + 1); }
function prevTrack() { loadTrack(currentTrackIndex - 1); }


window.addEventListener('message', function(e) {
    if (e.data.eventName === 'loadProgress') {
        const pct = e.data.loadFraction * 100;
        document.getElementById('loading-bar').style.width = pct + '%';
    }

    if (e.data.type === 'updateProgress') {
        if (e.data.progress) {
            document.getElementById('loading-bar').style.width = e.data.progress + '%';
        }
        if (e.data.message) {
            document.getElementById('loading-text').innerText = e.data.message;
        }
    }

    if (e.data.type === 'hideLoadingScreen') {
        document.body.style.display = 'none';
        stopAll();
    }
});
