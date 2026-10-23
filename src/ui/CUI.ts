import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { OrderService } from "../services/OrderService.js";
import { OrderItem } from "../models/OrderItem.js";
import { OrderStatus } from "../models/OrderStatus.js";
import { StandartDelivery } from "../delivery/StandartDelivery.js";
import { ExpressDelivery } from "../delivery/ExpressDelivery.js";
import { PickupDelivery } from "../delivery/PickupDelivery.js";
import { CountryList } from "../models/CountryList.js";

export class ConsoleUI {
    private rl = readline.createInterface({ input, output });
    private orderService = new OrderService();

    public async start(): Promise<void> {
        await this.orderService.init();

        console.log("=== Система управления доставкой ===");
        console.log(`Данные успешно загружены из хранилища.`);

        let running = true;

        while (running) {
            clearConsole();
            
            console.log(`
\nГлавное меню:
1. Создать клиента
2. Создать курьера
3. Создать новый заказ
4. Назначить курьера на заказ
5. Изменить статус заказа
6. Показать все заказы
7. Удалить заказ
0. Выход
            `)

            const choice = await this.rl.question("\nВыберите пункт меню: ");

            try {
                switch (choice.trim()) {
                    case "1":
                        await this.createClientFlow();
                        break;
                    case "2":
                        await this.createCourierFlow();
                        break;
                    case "3":
                        await this.createOrderFlow();
                        break;
                    case "4":
                        await this.assignCourierFlow();
                        break;
                    case "5":
                        await this.changeOrderStatusFlow();
                        break;
                    case "6":
                        this.showAllOrders();
                        await this.rl.question("\nНажмите Enter, чтобы вернуться в меню...");
                        break;
                    case "7":
                        await this.deleteOrderFlow();
                        break;
                    case "0":
                        running = false;
                        console.log("Выход из программы. До свидания!");
                        break;
                    default:
                        console.log("Неверный выбор. Попробуйте снова.");
                }
            } catch (error: any) {
                console.log(`\n[Ошибка]: ${error.message}`);
                await this.rl.question("\nНажмите Enter, чтобы продолжить...");
            }
        }

        this.rl.close();
    }

    private async createClientFlow(): Promise<void> {
        const name = await this.rl.question("Введите имя клиента: ");
        const phone = await this.rl.question("Введите номер телефона клиента: ");
        const client = await this.orderService.createClient(name, phone);
        console.log(`Клиент "${client.name}" успешно создан и сохранен!`);
        await this.rl.question("\nНажмите Enter, чтобы продолжить...");
    }

    private async createCourierFlow(): Promise<void> {
        const name = await this.rl.question("Введите имя курьера: ");
        const phone = await this.rl.question("Введите номер телефона курьера: ");
        const courier = await this.orderService.createCourier(name, phone);
        console.log(`Курьер "${courier.name}" успешно создан и сохранен!`);
        await this.rl.question("\nНажмите Enter, чтобы продолжить...");
    }

    private async createOrderFlow(): Promise<void> {
        const clients = this.orderService.getClients();
        if (clients.length === 0) {
            throw new Error("Сначала создайте хотя бы одного клиента!");
        }

        console.log("\nСписок клиентов:");
        clients.forEach((c, index) => console.log(`${index + 1}. ${c.name}, ${c.phone}`));
        const clientIndexStr = await this.rl.question("Выберите номер клиента: ");
        const clientIndex = parseInt(clientIndexStr) - 1;

        console.log("\nВыберите страну доставки:");
        console.log("1. Россия");
        console.log("2. Казахстан");
        console.log("3. Беларусь");
        const countryChoice = await this.rl.question("Ваш выбор (1-3): ");

        let country: CountryList;
        switch (countryChoice.trim()) {
            case "1":
                country = CountryList.RUS;
                break;
            case "2":
                country = CountryList.KAZ;
                break;
            case "3":
                country = CountryList.BLR;
                break;
            default:
                throw new Error("Неверный выбор страны доставки!");
        }

        const address = await this.rl.question("Введите адрес доставки: ");

        const items: OrderItem[] = [];
        let addingItems = true;
        while (addingItems) {
            const prodName = await this.rl.question("Введите название товара (или оставьте пустым для завершения): ");
            if (!prodName.trim()) break;

            const priceStr = await this.rl.question("Введите цену за единицу ($): ");
            const price = parseFloat(priceStr);
            if (isNaN(price) || price <= 0) throw new Error("Цена должна быть положительным числом!");

            const weightStr = await this.rl.question("Введите вес товара за единицу (грамм): ");
            const weight = parseFloat(weightStr);
            if (isNaN(weight) || weight <= 0) throw new Error("Вес должен быть положительным числом!");

            const qtyStr = await this.rl.question("Введите количество: ");
            const quantity = parseInt(qtyStr);
            if (isNaN(quantity) || quantity <= 0) throw new Error("Количество должно быть целым положительным числом!");

            items.push(new OrderItem(prodName.trim(), price, weight, quantity));
            console.log("Товар добавлен в заказ.");

            const more = await this.rl.question("Добавить еще товар? (y/n): ");
            if (more.trim().toLowerCase() !== 'y') {
                addingItems = false;
            }
        }

        if (items.length === 0) {
            throw new Error("В заказе должен быть хотя бы один товар!");
        }

        console.log("\nВыберите способ доставки:");
        console.log("1. Стандартная");
        console.log("2. Экспресс");
        console.log("3. Самовывоз");
        const deliveryChoice = await this.rl.question("Ваш выбор (1-3): ");

        let deliveryMethod;
        switch (deliveryChoice.trim()) {
            case "1":
                deliveryMethod = new StandartDelivery();
                break;
            case "2":
                deliveryMethod = new ExpressDelivery();
                break;
            case "3":
                deliveryMethod = new PickupDelivery();
                break;
            default:
                throw new Error("Неверный выбор способа доставки!");
        }

        const order = await this.orderService.createOrder(clientIndex, address, country, items, deliveryMethod);
        const itemsSum = order.getItemsCost();
        const deliveryCost = deliveryMethod.calculateCost(country, order.getItemsWeight());

        console.log(`\nЗаказ №${order.id} успешно создан! Стоимость доставки: $${deliveryCost}. Итого: $${itemsSum + deliveryCost}`);
        await this.rl.question("\nНажмите Enter, чтобы продолжить...");
    }

    private async assignCourierFlow(): Promise<void> {
        const orders = this.orderService.getOrders();
        const couriers = this.orderService.getCouriers();

        if (orders.length === 0) throw new Error("Нет доступных заказов.");
        if (couriers.length === 0) throw new Error("Нет зарегистрированных курьеров.");

        // Фильтруем только свободных курьеров
        const availableCouriers = couriers.filter(c => !c.getIsBusy());
        if (availableCouriers.length === 0) {
            throw new Error("В данный момент нет свободных курьеров (все заняты).");
        }

        console.log("\nСписок заказов:");
        orders.forEach(o => console.log(`ID: ${o.id} | Клиент: ${o.client.name} | Номер: ${o.client.phone} | Статус: ${o.getStatus()}`));
        const orderIdStr = await this.rl.question("Введите ID заказа: ");
        const orderId = parseInt(orderIdStr);

        console.log("\nСписок свободных курьеров:");
        availableCouriers.forEach((c, index) => {
            const originalIndex = couriers.indexOf(c); // находим реальный индекс в общем массиве сервиса
            console.log(`${index + 1}. ${c.name} | Тел: ${c.phone} (Индекс в системе: ${originalIndex + 1})`);
        });

        const courierChoiceStr = await this.rl.question("Выберите номер свободного курьера из списка: ");
        const choiceIndex = parseInt(courierChoiceStr) - 1;

        if (isNaN(choiceIndex) || !availableCouriers[choiceIndex]) {
            throw new Error("Неверный выбор курьера!");
        }

        const realCourierIndex = couriers.indexOf(availableCouriers[choiceIndex]);

        await this.orderService.assignCourier(orderId, realCourierIndex);
        console.log(`Курьер успешно назначен на заказ №${orderId}!`);
        await this.rl.question("\nНажмите Enter, чтобы продолжить...");
    }

    private async changeOrderStatusFlow(): Promise<void> {
        const orders = this.orderService.getOrders();
        if (orders.length === 0) throw new Error("Нет доступных заказов.");

        console.log("\nСписок заказов:");
        orders.forEach(o => console.log(`ID: ${o.id} | Статус: ${o.getStatus()}`));
        const orderIdStr = await this.rl.question("Введите ID заказа: ");
        const orderId = parseInt(orderIdStr);

        console.log("\nДоступные статусы:");
        const statuses = Object.values(OrderStatus);
        statuses.forEach((status, index) => console.log(`${index + 1}. ${status}`));
        
        const statusIndexStr = await this.rl.question("Выберите новый номер статуса: ");
        const statusIndex = parseInt(statusIndexStr) - 1;

        if (isNaN(statusIndex) || !statuses[statusIndex]) {
            throw new Error("Неверный статус!");
        }

        await this.orderService.changeOrderStatus(orderId, statuses[statusIndex]);
        console.log(`Статус заказа №${orderId} успешно изменен!`);
        await this.rl.question("\nНажмите Enter, чтобы продолжить...");
    }

    private showAllOrders(): void {
        const orders = this.orderService.getOrders();
        if (orders.length === 0) {
            console.log("\nСписок заказов пуст.");
            return;
        }

        console.log("\n=== Список всех заказов ===");
        orders.forEach(o => {
            const itemsSum = o.getItemsCost();
            const itemsWeight = o.getItemsWeight();
            const country = o.country;
            const delivery = o.getDelivery();
            const deliveryCost = delivery ? delivery.calculateCost(country, itemsWeight) : 0;
            const deliveryDays = delivery ? delivery.calculateDays(country, itemsWeight) : 0;

            console.log(`-----------------------------------`);
            console.log(`Заказ №${o.id}`);
            console.log(`Страна доставки: ${country}`);
            console.log(`Клиент: ${o.client.name} | Номер: ${o.client.phone}`);
            console.log(`Адрес: ${o.address}`);
            console.log(`Статус: ${o.getStatus()}`);
            console.log(`Товары:`);
            o.items.forEach(item => console.log(`  - ${item.productName} x${item.quantity} (${item.price}$/шт) = $${item.getTotalPrice()}`));
            console.log(`Общий вес товаров: ${itemsWeight} г`);
            console.log(`Сумма за товары: $${itemsSum}`);
            console.log(`Стоимость доставки: $${deliveryCost}`);
            console.log(`Итого к оплате: $${itemsSum + deliveryCost}`);
            console.log(`Срок доставки: ${deliveryDays} дн.`);
            console.log(`Курьер: ${o.getCourier() ? o.getCourier()!.name : 'Не назначен'} | Номер: ${o.getCourier() ? o.getCourier()!.phone : 'Не назначен'}`);
        });
        console.log(`-----------------------------------`);
    }

    private async deleteOrderFlow(): Promise<void> {
        const orders = this.orderService.getOrders();

        if (orders.length === 0) {
            throw new Error("Нет доступных заказов для удаления.");
        }

        console.log("\n=== Удаление заказа ===");
        orders.forEach(o => console.log(`ID: ${o.id} | Клиент: ${o.client.name} | Номер: ${o.client.phone} | Статус: ${o.getStatus()}`));

        const idChoiceStr = await this.rl.question("Введите ID заказа для удаления: ");
        const idChoice = parseInt(idChoiceStr);

        if (isNaN(idChoice)) {
            throw new Error("ID заказа должен быть числом!");
        }

        await this.orderService.deleteOrder(idChoice)

        console.log(`\nЗаказ №${idChoice} успешно удален!`);
        await this.rl.question("\nНажмите Enter, чтобы продолжить...");
    }
}

export const clearConsole = (): Promise<void> => {
    return new Promise((resolve) => {
        if (!output.isTTY) {
            resolve();
            return;
        }
        output.write("\x1b[H\x1b[2J", () => resolve());
    });
}