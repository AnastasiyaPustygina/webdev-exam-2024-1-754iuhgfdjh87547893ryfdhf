let allGoods = [];
    const API_URL = 'http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=7fab1c8b-edd2-4a44-a0b1-432da2a08de8';
    const catalog = document.getElementById('catalog');
    const categoriesContainer = document.getElementById('categories');
    const loadMoreButton = document.getElementById('load-more');

    let goods = [];
    let displayedGoods = 0;
    const GOODS_PER_PAGE = 10;

    async function fetchGoods() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            goods = data;
            allGoods = data;
            renderCategories();
            renderGoods();
        } catch (error) {
            console.error('Error fetching goods:', error);
        }
    }
    const sortSelect = document.getElementById('sort');
sortSelect.addEventListener('change', (event) => {
    const sortBy = event.target.value;
    console.log(event.target.value)
    sortGoods(sortBy);
});

function sortGoods(sortBy) {
    console.log(goods)
    // В зависимости от выбранной сортировки, применяем соответствующую сортировку
    if (sortBy === 'price-increase') {
    goods.sort((a, b) => {
        const priceA = a.discount_price || a.actual_price;
        const priceB = b.discount_price || b.actual_price;
        return priceA - priceB;
    });
} else if (sortBy === 'rating-increase') {
    goods.sort((a, b) => a.rating - b.rating);
} else if (sortBy === 'price-decrease') {
    goods.sort((a, b) => {
        const priceA = a.discount_price || a.actual_price;
        const priceB = b.discount_price || b.actual_price;
        return priceB - priceA;
    });
} else if (sortBy === 'rating-decrease') {
    goods.sort((a, b) => b.rating - a.rating);
}
    catalog.innerHTML = '';
    displayedGoods = 0;


    // После сортировки перерисовываем товары
    renderGoods();
}
    function renderCategories() {
        const categories = [...new Set(allGoods.map(good => good.main_category))];
        categoriesContainer.innerHTML = categories.map(category => `
            <label><input type="checkbox" value="${category}"> ${category}</label>
        `).join('');
    }

    function renderGoods() {
        const fragment = document.createDocumentFragment();
        const goodsToDisplay = goods.slice(displayedGoods, displayedGoods + GOODS_PER_PAGE);

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        goodsToDisplay.forEach(good => {
            const item = document.createElement('div');
            item.className = 'catalog-item';
            item.innerHTML = `
                <img src="${good.image_url}" alt="${good.name}">
                <h3 class="nameOfItem">${good.name}</h3>
                <div class="start-block">
                    ${good.discount_price ? `<span class="current-price">${good.discount_price} ₽</span> <span class="discount-price">${good.actual_price} ₽</span>` : `<span class="price">${good.actual_price} ₽</span>`}
                </div>
                <div class="flex-wrap">
                    <div class="rating">${good.rating}</div>
                    <img src="img/ic_rating.svg" id="img-rating" />
                </div>
                <button class="bt-add">Добавить</button>
            `;
            
            fragment.appendChild(item);
            const existingProduct = cart.find(product => good.id === product.id);
            if (existingProduct) {
                const itemContainer = item.closest('.catalog-item');
                itemContainer.classList.add('item-in-basket');
                itemContainer.querySelectorAll('.bt-add')[0].textContent = 'Удалить';
            }
        });

        catalog.appendChild(fragment);
        displayedGoods += GOODS_PER_PAGE;

        if (displayedGoods >= goods.length) {
            loadMoreButton.classList.add('hidden');
        } else {
            loadMoreButton.classList.remove('hidden');
        }

        setAddListener();
    }

    function addToCart(product, bt) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.id === product.id);
        const itemContainer = bt.closest('.catalog-item');
        if (existingProduct) {
            cart = cart.filter(p => p.id !== product.id);
            itemContainer.classList.remove('item-in-basket');
            bt.textContent = "Добавить";
        } else {
            cart.push(product);
            itemContainer.classList.add('item-in-basket');
            bt.textContent = "Удалить";
        }

        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function setAddListener() {
        const addToCartButtons = document.querySelectorAll('.bt-add');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productElement = button.closest('.catalog-item');
                const product = goods.filter(g => g.name == productElement.querySelector(".nameOfItem").textContent)[0];
                addToCart(product, button);
            });
        });
    }

    loadMoreButton.addEventListener('click', renderGoods);

    fetchGoods();
async function fetchAutocompleteSuggestions(query) {
    const autocompleteUrl = `http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/autocomplete?query=${encodeURIComponent(query)}&api_key=7fab1c8b-edd2-4a44-a0b1-432da2a08de8`;

    try {
        const response = await fetch(autocompleteUrl);
        if (!response.ok) {
            throw new Error(`Ошибка при загрузке автодополнений: ${response.status}`);
        }
        const suggestions = await response.json();

        return suggestions;
    } catch (error) {
        console.error('Ошибка при обработке автодополнения:', error);
        return [];
    }
}

    const priceFromInput = document.getElementById('price-from');
    const priceToInput = document.getElementById('price-to');
    const discountOnlyCheckbox = document.getElementById('discount-only');
    const applyFiltersButton = document.getElementById('apply-filters');
    const categoryCheckboxes = () => [...categoriesContainer.querySelectorAll('input[type="checkbox"]:checked')];

    function applyFilters() {
        const priceFrom = parseFloat(priceFromInput.value) || 0;
        const priceTo = parseFloat(priceToInput.value) || Infinity;
        const discountOnly = discountOnlyCheckbox.checked;
        const selectedCategories = categoryCheckboxes().map(cb => cb.value);

        const filteredGoods = allGoods.filter(good => {
            const inPriceRange = good.actual_price >= priceFrom && good.actual_price <= priceTo;
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(good.main_category);
            const matchesDiscount = !discountOnly || good.discount_price;

            return inPriceRange && matchesCategory && matchesDiscount;
        });

        catalog.innerHTML = '';
        displayedGoods = 0;
        goods = filteredGoods;
        renderGoods();
    }

    applyFiltersButton.addEventListener('click', applyFilters);

    function resetFilters() {
        priceFromInput.value = '';
        priceToInput.value = '';
        discountOnlyCheckbox.checked = false;
        categoriesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        goods = [];
        fetchGoods();
    }

    document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-bar');
    const autoCompleteList = document.createElement('div');
    autoCompleteList.id = 'autocomplete-list';
    autoCompleteList.style.position = 'absolute';
    autoCompleteList.style.backgroundColor = 'white';
    autoCompleteList.style.border = '1px solid #ddd';
    autoCompleteList.style.zIndex = '1000';
    autoCompleteList.style.width = `${searchInput.offsetWidth}px`;
    autoCompleteList.style.display = 'none';
    document.body.appendChild(autoCompleteList);

    let currentSuggestions = [];
    let currentIndex = -1;

    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim();
        if (!query) {
            autoCompleteList.style.display = 'none';
            return;
        }

        try {
            currentSuggestions = await fetchAutocompleteSuggestions(query); // Получаем данные с сервера
            renderSuggestions(currentSuggestions, query);
        } catch (error) {
            console.error('Ошибка при загрузке автодополнений:', error);
        }
    });

    function renderSuggestions(suggestions, query) {
        autoCompleteList.innerHTML = '';
        currentIndex = -1;

        if (suggestions.length === 0) {
            autoCompleteList.style.display = 'none';
            return;
        }

        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.textContent = suggestion;
            item.style.padding = '10px';
            item.style.cursor = 'pointer';

            // Подсветка совпадений
            const regex = new RegExp(`(${query})`, 'i');
            item.innerHTML = suggestion.replace(regex, `<strong>$1</strong>`);

            item.addEventListener('click', () => {
                searchInput.value = suggestion;
                autoCompleteList.style.display = 'none';
                fetchSearchResults(suggestion); // Отправляем запрос с выбранным значением
            });

            autoCompleteList.appendChild(item);
        });

        const { top, left } = searchInput.getBoundingClientRect();
        autoCompleteList.style.top = `${top + searchInput.offsetHeight + window.scrollY}px`;
        autoCompleteList.style.left = `${left + window.scrollX}px`;
        autoCompleteList.style.display = 'block';
    }

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            navigateSuggestions(1);
        } else if (e.key === 'ArrowUp') {
            navigateSuggestions(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentIndex >= 0 && currentIndex < currentSuggestions.length) {
                searchInput.value = currentSuggestions[currentIndex];
                autoCompleteList.style.display = 'none';
                fetchSearchResults(currentSuggestions[currentIndex]);
            } else {
                fetchSearchResults(searchInput.value.trim());
            }
        }
    });

    function navigateSuggestions(direction) {
        const items = autoCompleteList.querySelectorAll('div');
        if (items.length === 0) return;

        if (currentIndex >= 0) {
            items[currentIndex].style.backgroundColor = 'white';
            items[currentIndex].style.color = 'black';
        }

        currentIndex += direction;
        if (currentIndex < 0) currentIndex = items.length - 1;
        if (currentIndex >= items.length) currentIndex = 0;

        items[currentIndex].style.backgroundColor = '#007bff';
        items[currentIndex].style.color = 'white';
    }

// Добавить обработчик события на изменение селектора

    async function fetchSearchResults(query) {
        if (!query) return;

        try {
            const results = allGoods.filter(good => good.name.toLowerCase().includes(query.toLowerCase()));
            renderSearchResults(results);
        } catch (error) {
            console.error('Ошибка загрузки результатов поиска:', error);
        }
    }

    function renderSearchResults(results) {
        const catalog = document.getElementById('catalog');
        catalog.innerHTML = '';

        if (results.length === 0) {
            catalog.innerHTML = '<p>Нет товаров, соответствующих вашему запросу.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        goods = results;
        results.forEach((good) => {
            const item = document.createElement('div');
            item.className = 'catalog-item';
            item.innerHTML = `
                <img src="${good.image_url}" alt="${good.name}">
                <h3 class="nameOfItem">${good.name}</h3>
                <div class="start-block">
                    ${good.discount_price ? `<span class="current-price">${good.discount_price} ₽</span> <span class="discount-price">${good.actual_price} ₽</span>` : `<span class="price">${good.actual_price} ₽</span>`}
                </div>
                <div class="flex-wrap">
                    <div class="rating">${good.rating}</div>
                    <img src="img/ic_rating.svg" id="img-rating" />
                </div>
                <button class="bt-add">Добавить</button>
            `;
            fragment.appendChild(item);
        });

        catalog.appendChild(fragment);
    }
    // Закрыть автодополнение при клике вне поля поиска
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !autoCompleteList.contains(e.target)) {
            autoCompleteList.style.display = 'none';
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const closeSidebar = document.getElementById('close-sidebar');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });
});
