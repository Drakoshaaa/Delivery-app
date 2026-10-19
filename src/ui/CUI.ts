import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { OrderService } from "../services/OrderService.js";
import { OrderItem } from "../models/OrderItem.js";
import { OrderStatus } from "../models/OrderStatus.js";
import { StandartDelivery } from "../delivery/StandartDelivery.js";
import { ExpressDelivery } from "../delivery/ExpressDelivery.js";
import { PickupDelivery } from "../delivery/PickupDelivery.js";

export class ConsoleUI {
    private rl = readline.createInterface({ input, output });
    private orderService = new OrderService();

    public async start(): Promise<void> {
        await this.orderService.init();

        console.log("=== Система управления доставкой ===");
        console.log(`Данные успешно загружены из хранилища.`);

        let running = true;

        while (running) {
            console.clear();
            
            console.log(`
\nГлавное меню:
1. Создать клиента
2. Создать курьера
3. Создать новый заказ
4. Назначить курьера на заказ
5. Изменить статус заказа
6. Показать все заказы
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
                    case "0":
                        running = false;
                        console.log("Выход из программы. До свидания!");
                        break;
                    default:
                        console.log("Неверный выбор. Попробуйте снова.");
                }
            } catch (error: any) {
                console.log(`\n[Ошибка]: ${error.message}`);
            }
        }

        this.rl.close();
    }

    private async createClientFlow(): Promise<void> {
        const name = await this.rl.question("Введите имя клиента: ");
        const client = await this.orderService.createClient(name);
        console.log(`Клиент "${client.name}" успешно создан и сохранен!`);
    }

    private async createCourierFlow(): Promise<void> {
        const name = await this.rl.question("Введите имя курьера: ");
        const courier = await this.orderService.createCourier(name);
        console.log(`Курьер "${courier.name}" успешно создан и сохранен!`);
    }

    private async createOrderFlow(): Promise<void> {
        const clients = this.orderService.getClients();
        if (clients.length === 0) {
            throw new Error("Сначала создайте хотя бы одного клиента!");
        }

        console.log("\nСписок клиентов:");
        clients.forEach((c, index) => console.log(`${index + 1}. ${c.name}`));
        const clientIndexStr = await this.rl.question("Выберите номер клиента: ");
        const clientIndex = parseInt(clientIndexStr) - 1;

        const address = await this.rl.question("Введите адрес доставки: ");

        const items: OrderItem[] = [];
        let addingItems = true;
        while (addingItems) {
            const prodName = await this.rl.question("Введите название товара (или оставьте пустым для завершения): ");
            if (!prodName.trim()) break;

            const priceStr = await this.rl.question("Введите цену за единицу ($): ");
            const price = parseFloat(priceStr);
            if (isNaN(price) || price <= 0) throw new Error("Цена должна быть положительным числом!");

            const qtyStr = await this.rl.question("Введите количество: ");
            const quantity = parseInt(qtyStr);
            if (isNaN(quantity) || quantity <= 0) throw new Error("Количество должно быть целым положительным числом!");

            items.push(new OrderItem(prodName.trim(), price, quantity));
            console.log("Товар добавлен в заказ.");

            const more = await this.rl.question("Добавить еще товар? (y/n): ");
            if (more.trim().toLowerCase() !== 'y') {
                addingItems = false;
            }
        }

        console.log("\nВыберите способ доставки:");
        console.log("1. Стандартная");
        console.log("2. Экспресс");
        console.log("3. Самовывоз");
        const deliveryChoice = await this.rl.question("Ваш выбор (1-3): ");

        const itemsSum = items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
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

        const order = await this.orderService.createOrder(clientIndex, address, items, deliveryMethod);
        const deliveryCost = deliveryMethod.calculateCost(itemsSum);

        console.log(`\nЗаказ №${order.id} успешно создан! Стоимость доставки: $${deliveryCost}. Итого: $${itemsSum + deliveryCost}`);
    }

    private async assignCourierFlow(): Promise<void> {
        const orders = this.orderService.getOrders();
        const couriers = this.orderService.getCouriers();

        if (orders.length === 0) throw new Error("Нет доступных заказов.");
        if (couriers.length === 0) throw new Error("Нет доступных курьеров.");

        console.log("\nСписок заказов:");
        orders.forEach(o => console.log(`ID: ${o.id} | Клиент: ${o.client.name} | Статус: ${o.getStatus()}`));
        const orderIdStr = await this.rl.question("Введите ID заказа: ");
        const orderId = parseInt(orderIdStr);

        console.log("\nСписок курьеров:");
        couriers.forEach((c, index) => console.log(`${index + 1}. ${c.name} (Занят: ${c.getIsBusy() ? 'Да' : 'Нет'})`));
        const courierIndexStr = await this.rl.question("Выберите номер курьера: ");
        const courierIndex = parseInt(courierIndexStr) - 1;

        await this.orderService.assignCourier(orderId, courierIndex);
        console.log(`Курьер успешно назначен на заказ №${orderId}!`);
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
            const delivery = o.getDelivery();
            const deliveryCost = delivery ? delivery.calculateCost(itemsSum) : 0;
            const deliveryDays = delivery ? delivery.calculateDays(itemsSum) : 0;

            console.log(`-----------------------------------`);
            console.log(`Заказ №${o.id}`);
            console.log(`Клиент: ${o.client.name}`);
            console.log(`Адрес: ${o.address}`);
            console.log(`Статус: ${o.getStatus()}`);
            console.log(`Товары:`);
            o.items.forEach(item => console.log(`  - ${item.productName} x${item.quantity} = $${item.getTotalPrice()}`));
            console.log(`Сумма за товары: $${itemsSum}`);
            console.log(`Стоимость доставки: $${deliveryCost}`);
            console.log(`Итого к оплате: $${itemsSum + deliveryCost}`);
            console.log(`Срок доставки: ${deliveryDays} дн.`);
            console.log(`Курьер: ${o.getCourier() ? o.getCourier()!.name : 'Не назначен'}`);
        });
        console.log(`-----------------------------------`);
    }
}