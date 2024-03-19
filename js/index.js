import { API_KEY, VIDEOS_URL } from './key.js';

const videoListItems = document.querySelector('.video-list__items');

const fetchTrendingVideos = async () => {
    try {
        const url = new URL(VIDEOS_URL);
        url.searchParams.append('part', 'contentDetails,id,snippet');
        url.searchParams.append('chart', 'mostPopular');
        url.searchParams.append('regionCode', 'US');
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

fetchTrendingVideos().then(videos => {
    console.log(videos);
});

