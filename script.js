checkTheme();

document.getElementById('changeBtn').addEventListener('click', changeTheme);

function changeTheme() {
    let changeBtn = document.getElementById('changeBtn');
    changeBtn.classList.toggle('active');

    let body = document.querySelector('body');
    body.classList.toggle('dark');

    if (body.classList.contains('dark')) {
        
        localStorage.setItem('theme', 'dark');
    } else {
       
        localStorage.setItem('theme', 'white');
    }
}

function checkTheme() {
    let theme = localStorage.getItem('theme');
    if (theme == 'dark') {
        let changeBtn = document.getElementById('changeBtn');
        changeBtn.classList.add('active');

        let body = document.querySelector('body');
        body.classList.add('dark');
    }
}

async function sendRequest(url, method, data) {
    if (method == "POST") {
        let response = await fetch(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        response = await response.json();
        return response;
    } else if (method == "GET") {
        url = url + "?" + new URLSearchParams(data);
        let response = await fetch(url, {
            method: "GET"
        });
        response = await response.json();
        return response;
    }
}

let message = document.querySelector(".message");
let loader = document.querySelector(".loader");

async function searchMovie() {
    let search = document.querySelector(".search input[name='search']").value;

    if (!search) return;

    message.style.display = "none";
    loader.style.display = "block";

    let movie = await sendRequest("http://www.omdbapi.com/", "GET", {
        "apikey": "90de75b6",
        "t": search
    });

    loader.style.display = "none";
    if (movie.Response == "False") {
        message.innerHTML = movie.Error;
        message.style.display = "block";
    } else {
        showMovie(movie);
        searchSimilarMovies(search);
    }
}

function showMovie(movie) {
    let movieTitleH2 = document.querySelector('.movieTitle h2');
    movieTitleH2.innerHTML = movie.Title;

    let movieTitle = document.querySelector('.movieTitle');
    movieTitle.style.display = "block";

    let movieDiv = document.querySelector('.movie');
    movieDiv.style.display = "flex";

    let movieImage = document.querySelector('.movieImage');
    movieImage.style.backgroundImage = `url('${movie.Poster}')`;

    let movieDesc = document.querySelector('.movieDesc');
    movieDesc.innerHTML = "";

    let dataArray = ["imdbRating", "Plot", "Genre", "Actors", "Country", "Year", "Language"];

    dataArray.forEach((key) => {
        movieDesc.innerHTML = movieDesc.innerHTML + `
        <div class="desc">
           <div class="movieLeft">${key}</div>
           <div class="movieRight">${movie[key]}</div>
        </div>`;
    });
}

async function searchSimilarMovies(title) {
    let similarMovies = await sendRequest("http://www.omdbapi.com/", "GET", {
        "apikey": "90de75b6",
        "s": title
    });

    console.log(similarMovies);

    if (similarMovies.Response == "False") {
        document.querySelector(".similarTitle").style.display = "none";
        document.querySelector(".similarMovies").style.display = "none";
    } else {
        document.querySelector(".similarTitle h2")
            .innerHTML = ` Похожих фильмов ${similarMovies.totalResults}`;
        showSimilarMovies(similarMovies.Search);
    }
}

function showSimilarMovies(movies) {
    const similarMovies = document.querySelector('.similarMovies');
    const similarTitle = document.querySelector('.similarTitle');

    similarMovies.innerHTML = "";

    movies.forEach((movie) => {
        const exists = favs.some(fav => fav.imdbid == movie.imdbID);
        let favClass = exists ? 'active' : '';

        similarMovies.innerHTML = similarMovies.innerHTML + `
        <div class="similarCard" style="background-image:url('${movie.Poster}');">
            <div class="favStar ${favClass}" data-poster="${movie.Poster}" data-title="${movie.Title}" data-imdbid="${movie.imdbID}"></div>
            <h3>${movie.Title}</h3>
        </div>`;
    });

    similarMovies.style.display = "grid";
    similarTitle.style.display = "block";

    activateFavBtns();
}

function activateFavBtns() {
    document.querySelectorAll('.favStar').forEach((favBtn) => {
        favBtn.addEventListener('click', addToFav);
    });
}

let favs = localStorage.getItem('favs');
if (!favs) {
    favs = [];
    localStorage.setItem('favs', JSON.stringify(favs));
} else {
    favs = JSON.parse(favs);
    console.log("Избранное загружено:", favs);
}

function addToFav(event) {
    let favBtn = event.target;
    let poster = favBtn.getAttribute('data-poster');
    let title = favBtn.getAttribute('data-title');
    let imdbid = favBtn.getAttribute('data-imdbid');

    const exists = favs.some(fav => fav.imdbid == imdbid);

    if (exists) {
        favs = favs.filter(fav => fav.imdbid !== imdbid);
        localStorage.setItem('favs', JSON.stringify(favs));

        favBtn.classList.remove('active');
        console.log(`Удалено из избранного: ${title}`);
    } else {
        let fav = { imdbid, title, poster };
        favs.push(fav);
        localStorage.setItem('favs', JSON.stringify(favs));

        favBtn.classList.add('active');
        console.log(`Добавлено в избранное: ${title}`);
    }

    console.log("Текущее избранное:", favs);
}


let searchBtn = document.querySelector(".search button");
searchBtn.addEventListener('click', searchMovie);


let searchInput = document.querySelector(".search input[name='search']");
searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        searchMovie(); 
    }
});




