const API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=7fab1c8b-edd2-4a44-a0b1-432da2a08de8";


const ordersContainer = document.getElementById("orders-container");
let orders = [];


async function fetchOrders() {
    const notification = localStorage.getItem("notification");
    if (notification) {
        const { message, type } = JSON.parse(notification);
        showNotification(message, type);
        localStorage.removeItem("notification");
    }
    try {
        const response = await fetch(API_URL);
        orders = await response.json();
        orders.reverse();
        renderOrders(orders);
    } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
    }
}


document.addEventListener("DOMContentLoaded", fetchOrders);

const overlay = document.querySelector('.shadow-main');
const API_URL_PUT = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/";
const modal = document.getElementById("modal-view");
const modalForm = document.getElementById("modal-form-view");
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");

async function renderOrders(orders) {
    let count = 1;
    ordersContainer.innerHTML = "";
    for (const order of orders) {
        // Загрузка товаров
        const goodsPromises = order.good_ids.map(id =>
            fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods/${id}?api_key=7fab1c8b-edd2-4a44-a0b1-432da2a08de8`)
                .then(response => response.json())
                .catch(err => {
                    console.error("Ошибка получения информации о товаре:", err);
                    return { actual_price: 0, discount_price: 0 };
                })
        );

        const goods = await Promise.all(goodsPromises);

        const goodsCost = goods.reduce((sum, good) => {
            return sum + (good.discount_price || good.actual_price || 0);
        }, 0);

        const deliveryCost = calculateDeliveryCost(order.delivery_date, order.delivery_interval);

        const orderCost = goodsCost + deliveryCost;

        const orderCard = document.createElement("div");
        orderCard.className = "order-card";

        orderCard.innerHTML = `
            <h3>Заказ № ${count}</h3>
            <p>Дата оформления: ${new Date(order.created_at).toLocaleDateString()}</p>
            <p>Адрес доставки: ${order.delivery_address}</p>
            <p>Дата доставки: ${order.delivery_date}</p>
            <p>Время доставки: ${order.delivery_interval}</p>
            <p  id="order=order-cost-view">Стоимость: ${orderCost} Р (включая доставку: ${deliveryCost} Р)</p>
            <div class="order-icons">
                <img src="img/ic_see.png" class="ic-see" title="Просмотр" onclick="viewOrder(${order.id})">
                <img src="img/ic_edit.png" class="ic-edit" title="Редактировать" onclick="editOrder(${order.id})">
                <img src="img/ic_delete.png" class="ic-delete" title="Удалить" onclick="deleteOrder(${order.id})">
            </div>
        `;
        count++;

        ordersContainer.appendChild(orderCard);
    }
}

function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        console.error("Заказ не найден:", orderId);
        return;
    }

    document.getElementById("full-name-edit").value = order.full_name || "";
    document.getElementById("email-edit").value = order.email || "";
    document.getElementById("phone-edit").value = order.phone || "";
    document.getElementById("address-edit").value = order.delivery_address || "";
    document.getElementById("delivery-date-edit").value = order.delivery_date || "";
    document.getElementById("delivery-time-edit").value = order.delivery_interval || "";
    document.getElementById("comment-edit").value = order.comment || "";
    overlay.classList.add('overlay-show');
    editModal.classList.add("show");
 editModal.classList.remove("hidden");
    editForm.onsubmit = (event) => {
        event.preventDefault();
        submitEditForm(orderId);
    };
}

function closeModal() {
    modal.classList.remove("show");

    editModal.classList.remove("show");
    modal.classList.add("hidden");
    editModal.classList.add("hidden");

    overlay.classList.remove("overlay-show");
    overlay.classList.add("hidden");
}
async function viewOrder(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    modal.classList.add("show");
    modal.classList.remove("hidden");

    document.getElementById("full-name-view").textContent = order.full_name || "";
    document.getElementById("email-view").textContent = order.email || "";
    document.getElementById("phone-view").textContent = order.phone || "";
    document.getElementById("address-view").textContent = order.delivery_address || "";
    document.getElementById("delivery-date-view").textContent = order.delivery_date || "";
    document.getElementById("delivery-time-view").textContent = order.delivery_interval || "";
    document.getElementById("comment-view").textContent = order.comment || "";

    const goodsContainer = document.getElementById("goods-view");
    goodsContainer.innerHTML = "Загрузка состава заказа...";

    try {
        const goodsPromises = order.good_ids.map(id =>
            fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods/${id}?api_key=7fab1c8b-edd2-4a44-a0b1-432da2a08de8`)
                .then(response => response.json())
                .catch(err => {
                    console.error("Ошибка получения информации о товаре:", err);
                    return { name: "Неизвестный товар", discount_price: 0, actual_price: 0 };
                })
        );

        const goods = await Promise.all(goodsPromises);

        goodsContainer.innerHTML = goods
            goodsContainer.innerHTML = goods
            .map(good => {
                const name = good.name || "Неизвестный товар";
                const shortName = name.length > 30 ? name.slice(0, 30) + "..." : name;
                return `<li>${shortName}</li>`;
            });

        const goodsCost = goods.reduce((sum, good) => {
            return sum + (good.discount_price || good.actual_price || 0);
        }, 0);

        const deliveryCost = calculateDeliveryCost(order.delivery_date, order.delivery_interval);
        const orderCost = goodsCost + deliveryCost;

    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
        goodsContainer.innerHTML = "Не удалось загрузить состав заказа.";
    }

    overlay.classList.add("overlay-show");
    overlay.classList.remove("hidden");
}



async function submitEditForm(orderId) {
    const updatedOrder = {
        full_name: document.getElementById("full-name-edit").value,
        email: document.getElementById("email-edit").value,
        phone: document.getElementById("phone-edit").value,
        delivery_address: document.getElementById("address-edit").value,
        delivery_date: document.getElementById("delivery-date-edit").value,
        delivery_interval: document.getElementById("delivery-time-edit").value,
        comment: document.getElementById("comment-edit").value,
        subscribe: orders.find(o => o.id === orderId).subscribe,
    };

    const deliveryCost = calculateDeliveryCost(updatedOrder.delivery_date, updatedOrder.delivery_interval);

    console.log(`Обновлённая стоимость доставки: ${deliveryCost} Р`);

    try {
        const response = await fetch(`${API_URL_PUT}${orderId}?api_key=7fab1c8b-edd2-4a44-a0b1-432da2a08de8`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedOrder),
        });

        if (response.ok) {
            closeModal("edit-modal");
            showNotification("Изменения сохранены успешно!", "success");
            fetchOrders();
        } else {
            console.error("Ошибка обновления заказа:", response.status, await response.text());
            showNotification("Ошибка сохранения изменений.", "error");
        }
    } catch (error) {
        console.error("Ошибка при отправке данных:", error);
        showNotification("Произошла ошибка при отправке данных!", "error");
        closeModal("edit-modal");
    }
}

async function deleteOrder(orderId) {
    confirmDeleteOrder(orderId);
}

let orderIdToDelete = null; 


function confirmDeleteOrder(orderId) {
    orderIdToDelete = orderId; // Запоминаем ID заказа
    const deleteModal = document.getElementById("delete-modal");
    deleteModal.classList.remove("hidden");
    deleteModal.classList.add("show");
    overlay.classList.add("overlay-show");
    overlay.classList.remove("hidden");
}


function closeDeleteModal() {
    const deleteModal = document.getElementById("delete-modal");
    deleteModal.classList.remove("show");
    deleteModal.classList.add("hidden");
    overlay.classList.remove("overlay-show");
    overlay.classList.add("hidden");
}

async function confirmDelete() {
    if (orderIdToDelete === null) return;

    try {
        const response = await fetch(`${API_URL_PUT}${orderIdToDelete}?api_key=7fab1c8b-edd2-4a44-a0b1-432da2a08de8`, {
            method: "DELETE",
        });

        if (response.ok) { 
            showNotification("Удаление прошло успешно!", "success");
            fetchOrders();
            closeDeleteModal(); 
        } else {
            console.error("Ошибка удаления заказа:", response.statusText);
            showNotification("Произошла ошибка при удалении!", "error");
            closeDeleteModal();
        }
    } catch (error) {
        console.error("Ошибка сети при удалении заказа:", error);
        alert("Ошибка сети. Проверьте подключение к интернету и повторите попытку.");
        closeDeleteModal();
    }
}
function showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    notification.textContent = ""; 
    notification.className = "notification"; 

    setTimeout(() => {

        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.className = `notification ${type}`;
        }, 5000);
    }, 10);
}
function calculateDeliveryCost(deliveryDate, deliveryTime) {
    const date = new Date(deliveryDate);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    let cost = 200; // Базовая стоимость

    if (isWeekend && deliveryTime.startsWith('18:')) {
        cost += 300;
    } else if (deliveryTime.startsWith('18:')) {
        cost += 200;
    }

    return cost;
}