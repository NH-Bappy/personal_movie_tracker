const API_KEY = "575d8548a88482dc6373232b1c26355a";
const API_URL = "https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
    try {
        const [res1, res2] = await Promise.all([
            fetch(`${API_URL}/movie/popular?api_key=${API_KEY}&page=1`),
            fetch(`${API_URL}/movie/popular?api_key=${API_KEY}&page=2`)
        ]);
        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
        return [...(data1.results || []), ...(data2.results || [])];
    } catch (err) {
        console.error("Error fetching popular movies:", err);
        return [];
    }
};


export const searchMovies = async (query) => {
    try {
        const [res1, res2] = await Promise.all([
            fetch(`${API_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`),
            fetch(`${API_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=2`)
        ]);
        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
        return [...(data1.results || []), ...(data2.results || [])];
    } catch (err) {
        console.error("Error searching movies:", err);
        return [];
    }
};

export const getMovieDetails = async (id) => {
    const response = await fetch(`${API_URL}/movie/${id}?api_key=${API_KEY}`);
    const data = await response.json();
    return data;
};