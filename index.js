const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
let filteredMovies = []

const movies = []

const dataPanel = document.querySelector('#data-panel')
const card = document.querySelector('#th')
const list = document.querySelector('#bar')

const STATE = {
    Card: 'Card',
    List: 'List'
}
const controller = {
    state: STATE.Card
}


// function 區域
function renderMovieList(data) {
    let rawHTML = ''
    data.forEach((item) => {
        // title, image, id 隨著每個 item 改變
        rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image
            }" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
    })
    dataPanel.innerHTML = rawHTML
}

function renderToList(data) {
    let rawHTML = '<ul class="list-group">'
    data.forEach((item) => {
        // title, image, id 隨著每個 item 改變
        rawHTML += `
            <li class="list-group-item">
                <div class="row">
                    <div class="col-9">
                        ${item.title}
                    </div>
                    <div class="col-3">
                        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                            data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                    </div>
                </div>
            </li>
        `
    })
    rawHTML += '</ul>'
    dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')
    axios.get(INDEX_URL + id).then((response) => {
        const data = response.data.results
        modalTitle.innerText = data.title
        modalDate.innerText = 'Release date: ' + data.release_date
        modalDescription.innerText = data.description
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image
            }" alt="movie-poster" class="img-fluid">`
    })
}

// 顯示card資料包成函數
function showCardData() {
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
}

// 渲染list資料
function showListData() {
    renderPaginator(movies.length)
    renderToList(getMoviesByPage(1))
}

function addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = movies.find((movie) => movie.id === id)
    if (list.some((movie) => movie.id === id)) {
        return alert('此電影已經在收藏清單中！')
    }
    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMoviesByPage(page) {
    const data = filteredMovies.length ? filteredMovies : movies
    const startIndex = (page - 1) * MOVIES_PER_PAGE

    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
    //計算總頁數
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
    //製作 template
    let rawHTML = ''

    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    //放回 HTML
    paginator.innerHTML = rawHTML
}


// 監聽區域
// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(event.target.dataset.id)
    }
    else if (event.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(event.target.dataset.id))
    }
})

// 監聽表單提交事件
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
    event.preventDefault()
    const keyword = searchInput.value.trim().toLowerCase()

    // if (!keyword.length) {
    //   return alert('請輸入有效字串！')
    // }
    filteredMovies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
    )
    //錯誤處理：無符合條件的結果
    if (filteredMovies.length === 0) {
        return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
    }
    //重製分頁器
    renderPaginator(filteredMovies.length)
    //預設顯示第 1 頁的搜尋結果
    renderMovieList(getMoviesByPage(1))
})

const paginator = document.querySelector('#paginator')
paginator.addEventListener('click', function onPaginatorClicked(event) {
    //如果被點擊的不是 a 標籤，結束
    if (event.target.tagName !== 'A') return

    //透過 dataset 取得被點擊的頁數
    const page = Number(event.target.dataset.page)
    //更新畫面
    switch (controller.state) {
        case STATE.Card:
            renderMovieList(getMoviesByPage(page))
            break
        case STATE.List:
            renderToList(getMoviesByPage(page))
            break
    }
})

// list的按鈕被點擊
list.addEventListener('click', function clickList(event) {
    controller.state = STATE.List
    showListData()
})

// card的按鈕被點擊
card.addEventListener('click', function clickCard(event) {
    controller.state = STATE.Card
    showCardData()
})


// 主程序區域
// 網頁開啟時獲取資料
axios
    .get(INDEX_URL)
    .then((response) => {
        movies.push(...response.data.results)
        showCardData()
    })
    .catch((err) => console.log(err))