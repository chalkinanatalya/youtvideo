import { API_KEY, VIDEOS_URL, favoriteIds } from './key.js';

const videoListItems = document.querySelector('.video-list__items');

const convertISOtoReadableDduration = (isoDuration) => {
    const hoursMatch = isoDuration.match(/(\d+)H/);
    const minutesMatch = isoDuration.match(/(\d+)M/);
    const secondsMatch = isoDuration.match(/(\d+)S/);

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;

    let result = '';

    if (hours > 0) {
        result +=`${hours} h `;
    }
    if (minutes > 0) {
        result +=`${minutes} min `;
    }
    if (seconds > 0) {
        result +=`${seconds} sec`;
    }

    return result.trim();
}

const formatDate = (isoString) => {
    const date = new Date(isoString);

    const formatter = new Intl.DateTimeFormat('en-EN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return formatter.format(date);
}

const fetchTrendingVideos = async () => {
    try {
        const url = new URL(VIDEOS_URL);
        url.searchParams.append('part', 'contentDetails,id,snippet');
        url.searchParams.append('chart', 'mostPopular');
        url.searchParams.append('regionCode', 'US');
        url.searchParams.append('maxResults', '12');
        url.searchParams.append('key', API_KEY);
        
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.log('error', error);
    }
}

const fetchFavoriteVideos = async () => {
    try {
        if(favoriteIds.length === 0) {
            return {items: []}
        }
        const url = new URL(VIDEOS_URL);
        url.searchParams.append('part', 'contentDetails,id,snippet');
        url.searchParams.append('maxResults', '12');
        url.searchParams.append('id', favoriteIds.join(','));
        url.searchParams.append('key', API_KEY);
        
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.log('error', error);
    }
}

const fetchVideoData = async (id) => {
    try {
        const url = new URL(VIDEOS_URL);
        url.searchParams.append('part', 'snippet,statistics');
        url.searchParams.append('id', id);
        url.searchParams.append('key', API_KEY);
        
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.log('error', error);
    }
}

const displayListVideo = async (videos) => {
    videoListItems.textContent = '';

    const listVideos = videos.items.map((video) => {
        const duration = video.contentDetails && video.contentDetails.duration
            ? convertISOtoReadableDduration(video.contentDetails.duration)
            : 'Duration unknown'; 

        const li = document.createElement('li');
        li.classList.add('video-list__item');
        li.innerHTML = `
        <article class="video-card">
            <a href="/video.html?id=${video.id}" class="video-card__link">
                <img src="${
                    video.snippet.thumbnails.standard?.url || 
                    video.snippet.thumbnails.high?.url
                }" alt="video preview ${video.snippet.title}"
                    class="video-card__thumbnail">
                <h3 class="video-card__title">${video.snippet.title}</h3>
                <p class="video-card__channel">${video.snippet.channelTitle}</p>
                <p class="video-card__duration">${duration}</p>
            </a>
            <button class="video-card__favorite favorite ${favoriteIds.includes(video.id) ? 'active' : ''}" type="button"
                aria-label="Add to Favorites ${video.snippet.title}" data-video-id="${video.id}">
                <svg class="video-card__icon">
                    <use class="star-o" xlink:href="/image/sprite.svg#star-ob"></use>
                    <use class="star" xlink:href="/image/sprite.svg#star"></use>
                </svg>
            </button>
        </article>
        `;
        return li;
    });

    videoListItems.append(...listVideos);
}

const displayVideo = ({items: [video]}) => {
    const videoElement = document.querySelector('.video');

    videoElement.innerHTML = `
    <div class="container">
        <div class="video__player">
            <iframe class="video__iframe" src="https://www.youtube.com/embed/${video.id}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen></iframe>
        </div>
        <div class="video__container">
            <div class="video__content">
                <h2 class="video__title">
                    ${video.snippet.title}
                </h2>
                <p class="video__channel">
                ${video.snippet.channelTitle}
                </p>
                <p class="video__info">
                    <span class="video__views">${parseInt(video.statistics.viewCount).toLocaleString()} views</span>
                    <span class="video__date">Premiere date: ${formatDate(video.snippet.publishedAt)}</span>
                </p>
                <p class="video__description">${video.snippet.description}</p>
            </div>

            <button href="/favorite.html" class="video__link favorite ${favoriteIds.includes(video.id) ? 'active' : ''}">
                <span class="video__no-favorite">Favorites</span>
                <span class="video__favorite">In Favorites</span>
                <svg class="video__icon">
                    <use xlink:href="/image/sprite.svg#star-ob"></use>
                </svg>
            </button>
        </div>
    </div>
    `
}

const init = () => {
    const currentPage = location.pathname.split('/').pop();
    const urlSearchParams = new URLSearchParams(location.search);
    const videoId = urlSearchParams.get('id');
    const searchQuery = urlSearchParams.get('q');

    if(currentPage === 'index.html' || currentPage === '') {
        fetchTrendingVideos().then(displayListVideo);
    } else if (currentPage === 'video.html' && videoId) {
        fetchVideoData(videoId).then(displayVideo);
    } else if (currentPage === 'favorite.html') {
        fetchFavoriteVideos().then(displayListVideo);
    } else if (currentPage === 'search.html' && searchQuery) {
        console.log('search');
    }

    document.body.addEventListener('click', ({target}) => {
        const itemFavorite = target.closest('.favorite');

        if(itemFavorite) {
            const videoId = itemFavorite.dataset.videoId;
            if(favoriteIds.includes(videoId)) {
                favoriteIds.splice(favoriteIds.indexOf(videoId), 1);
                localStorage.setItem('favoriteYT', JSON.stringify(favoriteIds));
                itemFavorite.classList.remove('active')
            } else {
                favoriteIds.push(videoId);
                localStorage.setItem('favoriteYT', JSON.stringify(favoriteIds));
                itemFavorite.classList.add('active')
            }
        }
    });
}

init();




