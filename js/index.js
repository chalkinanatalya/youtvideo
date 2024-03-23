import { API_KEY, VIDEOS_URL } from './key.js';

const videoListItems = document.querySelector('.video-list__items');

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

const displayVideo = async (videos) => {
    videoListItems.textContent = '';

    const listVideos = videos.items.map((video) => {
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
                <p class="video-card__duration">${video.contentDetails.duration}</p>
            </a>
            <button class="video-card__favorite" type="button"
                aria-label="Add to Favorites ${video.snippet.title}">
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

fetchTrendingVideos().then(displayVideo);

