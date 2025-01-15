        const API_URL = 'https://edu.std-900.ist.mospolytech.ru';
        const  API_KEY = '7fab1c8b-edd2-4a44-a0b1-432da2a08de8';
    let totalPrice = 0;
            const basket = document.getElementById('cart-items');
            let cart = JSON.parse(localStorage.getItem('cart')) || []; // Берем корзину из localStorage или создаем пустую
            function renderGoods() {
            totalPrice = 0;
            cart = JSON.parse(localStorage.getItem('cart')) || [];
            const fragment = document.createDocumentFragment();
            basket.innerHTML = '';
            cart.forEach(good => {
                totalPrice += good.discount_price ? good.discount_price : good.actual_price;
                const item = document.createElement('div');
                item.className = 'cart-item';
                item.innerHTML = `
                    <img src="${good.image_url}" alt="${good.name}">
                    <h3 class="nameOfItem">${good.name}</h3>
                    <div class="start-block">
                        ${good.discount_price ? `<span class="current-price">${good.discount_price} ₽</span> <span class="discount-price">${good.actual_price} ₽</span>` : `<span class="price">${good.actual_price} ₽</span>`}

                    </div>
                    <div class="flex-wrap">
                    <div class="rating">${good.rating}</div>
                    <img src="img/ic_rating.svg" id="img-rating"
                    </div>
                    <button class="bt-remove">Удалить</button>
                `;
                
                fragment.appendChild(item);
            });

            basket.appendChild(fragment);
            if(cart.length == 0){
                const item = document.createElement('div');
                item.innerHTML = `
                <p class="subtext">Корзина пуста!</p>
                `;

            basket.appendChild(item);
            }

            document.getElementById('totalPrice').innerHTML = 'Итого: ' + totalPrice + '₽'
            console.log(totalPrice);
            setRemoveListener();
        }
        function setRemoveListener(){
            const addToCartButtons = document.querySelectorAll('.bt-remove');
addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    const productElement = button.closest('.cart-item');
    const product = cart.filter(g => g.name == productElement.querySelectorAll(".nameOfItem")[0].textContent)[0];
    console.log("set remove");
    removeGood(product);
  });
});

        }
        function removeGood(product){
            cart = cart.filter(g => g.id != product.id);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderGoods();
        }
        renderGoods();
        document.getElementById('submit_order').addEventListener('click', async () => {

  const fullName = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const deliveryAddress = document.getElementById('address').value.trim();
  const deliveryDate = document.getElementById('date').value;
  const deliveryInterval = document.getElementById('delivery_interval').value;
  const comment = document.getElementById('comment').value.trim();
  

  if (!fullName || !email || !phone || !deliveryAddress || !deliveryDate || !deliveryInterval) {
    alert('Пожалуйста, заполните все обязательные поля.');
    return;
  }

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    alert('Корзина пуста. Добавьте товары в корзину перед оформлением заказа.');
    return;
  }
  
  const goodIds = cart.map(product => parseInt(product.id, 10));
  const isSubscribe = document.getElementById('subscribe').checked;
  

  const orderData = {
    full_name: fullName,
    email: email,
    phone: phone,
    delivery_address: deliveryAddress,
    delivery_date: deliveryDate.split('-').reverse().join('.'),
    delivery_interval: deliveryInterval,
    comment: comment || '',
    good_ids: goodIds,
    subscribe: Number(isSubscribe)
  };
  console.log(orderData);
  try {
    // Отправка POST-запроса
    const response = await fetch(API_URL + '/exam-2024-1/api/orders?api_key=' + API_KEY, {
      method: 'POST',
      headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },

      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      console.error("Ошибка сервера:", response.status);

        showNotification("Вы оформили заказ", "success");
      const errorText = await response.text();
      console.error("Ответ сервера:", errorText);
      
    showNotification("Ошибка при оформлении заказа", "error");
      return;
    }

    const data = await response.json();
    console.log("Успех:", data);
    localStorage.clear();
    window.location.href = 'https://webdev-exam-2024-1-754iuhgfdjh8754789.netlify.app/account#r';
    localStorage.setItem("notification", JSON.stringify({
    message: "Вы оформили заказ",
    type: "success"
}));
  } catch (error) {
    console.error("Ошибка:", error.message);
    showNotification("Ошибка при оформлении заказа", "error");
  }
});
        function showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    notification.textContent = ""; 
    notification.className = "notification"; 

    setTimeout(() => {
        // Устанавливаем текст и класс типа
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        // Убираем уведомление через 5 секунд
        setTimeout(() => {
            notification.className = `notification ${type}`;
        }, 5000);
    }, 10);
}