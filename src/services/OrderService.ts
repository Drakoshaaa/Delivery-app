import { Client } from "../models/Client.js";
import { Courier } from "../models/Courier.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { OrderStatus } from "../models/OrderStatus.js";
import { DeliveryMethodInterface } from "../delivery/DeliveryMethodInterface.js";
import { StorageService } from "./StorageService.js";

export class OrderService {
    private storage = new StorageService();
    
    private clients: Client[] = [];
    private couriers: Courier[] = [];
    private orders: Order[] = [];
    private orderIdCounter: number = 1;

    // Загрузка данных при старте
    public async init(): Promise<void> {
        const loaded = await this.storage.loadData();
        this.clients = loaded.clients;
        this.couriers = loaded.couriers;
        this.orders = loaded.orders;
        this.orderIdCounter = loaded.orderIdCounter;
    }

    // Сохранение текущего состояния в JSON
    private async persist(): Promise<void> {
        await this.storage.saveData(this.clients, this.couriers, this.orders, this.orderIdCounter);
    }

    public getClients(): Client[] {
        return this.clients;
    }

    public getCouriers(): Courier[] {
        return this.couriers;
    }

    public getOrders(): Order[] {
        return this.orders;
    }

    // Бизнес-логика создания клиента
    public async createClient(name: string): Promise<Client> {
        if (!name.trim()) throw new Error("Имя клиента не может быть пустым!");
        const client = new Client(name.trim());
        this.clients.push(client);
        await this.persist();
        return client;
    }

    // Бизнес-логика создания курьера
    public async createCourier(name: string): Promise<Courier> {
        if (!name.trim()) throw new Error("Имя курьера не может быть пустым!");
        const courier = new Courier(name.trim());
        this.couriers.push(courier);
        await this.persist();
        return courier;
    }

    // Бизнес-логика создания заказа
    public async createOrder(
        clientIndex: number,
        address: string,
        items: OrderItem[],
        deliveryMethod: DeliveryMethodInterface
    ): Promise<Order> {
        if (this.clients.length === 0) {
            throw new Error("Сначала создайте хотя бы одного клиента!");
        }
        if (!this.clients[clientIndex]) {
            throw new Error("Неверный номер клиента!");
        }
        if (!address.trim()) {
            throw new Error("Адрес доставки не может быть пустым!");
        }
        if (items.length === 0) {
            throw new Error("В заказе должен быть хотя бы один товар!");
        }

        const client = this.clients[clientIndex];
        const order = new Order(this.orderIdCounter++, client, address.trim(), items);
        order.setDelivery(deliveryMethod);

        this.orders.push(order);
        await this.persist();
        return order;
    }

    // Назначение курьера на заказ
    public async assignCourier(orderId: number, courierIndex: number): Promise<void> {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) throw new Error("Заказ с таким ID не найден!");

        const delivery = order.getDelivery();
        if (delivery && !delivery.requiresCourier()) {
            throw new Error("Для данного способа доставки курьер не требуется!");
        }

        if (!this.couriers[courierIndex]) {
            throw new Error("Неверный номер курьера!");
        }

        const courier = this.couriers[courierIndex];
        order.setCourier(courier);
        courier.setIsBusy(true);

        await this.persist();
    }

    // Изменение статуса заказа
    public async changeOrderStatus(orderId: number, newStatus: OrderStatus): Promise<void> {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) throw new Error("Заказ не найден!");

        order.setStatus(newStatus);
        await this.persist();
    }
}