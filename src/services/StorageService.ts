import * as fs from "fs/promises";
import * as path from "path";
import { Client } from "../models/Client.js";
import { Courier } from "../models/Courier.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { OrderStatus } from "../models/OrderStatus.js";
import { DeliveryMethodInterface } from "../delivery/DeliveryMethodInterface.js";
import { StandartDelivery } from "../delivery/StandartDelivery.js";
import { ExpressDelivery } from "../delivery/ExpressDelivery.js";
import { PickupDelivery } from "../delivery/PickupDelivery.js";
import { CountryList } from "../models/CountryList.js";

interface DatabaseSchema {
    clients: { 
        name: string;
        phone: string;
    }[];
    couriers: {
        name: string;
        phone: string;
        isBusy: boolean; 
    }[];
    orders: {
        id: number;
        clientName: string;
        clientPhone: string;
        country: CountryList;
        address: string;
        status: OrderStatus;
        items: { productName: string;
                price: number;
                weight: number;
                quantity: number;
        }[];
        deliveryType: "Standart" | "Express" | "Pickup";
        courierName?: string;
        courierPhone?: string;
    }[];
    orderIdCounter: number;
}

export class StorageService {
    private filePath: string;

    constructor(fileName: string = "src/data/database.json") {
        this.filePath = path.resolve(process.cwd(), fileName);
    }

    public async saveData(
        clients: Client[],
        couriers: Courier[],
        orders: Order[],
        orderIdCounter: number
    ): Promise<void> {
        const data: DatabaseSchema = {
            clients: clients.map(c => ({ name: c.name, phone: c.phone})),
            couriers: couriers.map(co => ({ name: co.name, phone: co.phone, isBusy: co.getIsBusy() })),
            orders: orders.map(o => {
                let deliveryType: "Standart" | "Express" | "Pickup" = "Standart";
                const method = o.getDelivery();
                if (method instanceof ExpressDelivery) deliveryType = "Express";
                else if (method instanceof PickupDelivery) deliveryType = "Pickup";

                return {
                    id: o.id,
                    clientName: o.client.name,
                    clientPhone: o.client.phone,
                    country: o.country,
                    address: o.address,
                    status: o.getStatus(),
                    items: o.items.map(i => ({
                        productName: i.productName,
                        price: i.price,
                        weight: i.weight,
                        quantity: i.quantity
                    })),
                    deliveryType,
                    courierName: o.getCourier()?.name,
                    courierPhone: o.getCourier()?.phone
                };
            }),
            orderIdCounter
        };

        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    }

    public async loadData(): Promise<{
        clients: Client[];
        couriers: Courier[];
        orders: Order[];
        orderIdCounter: number;
    }> {
        try {
            const fileContent = await fs.readFile(this.filePath, "utf-8");
            const data: DatabaseSchema = JSON.parse(fileContent);

            const clients = data.clients.map(c => new Client(c.name, c.phone));

            const couriers = data.couriers.map(co => {
                const courier = new Courier(co.name, co.phone);
                courier.setIsBusy(co.isBusy);
                return courier;
            });

            const orders = data.orders.map(oData => {
                const client = clients.find(c => (c.name === oData.clientName && c.phone === oData.clientPhone)) || new Client(oData.clientName, oData.clientPhone);
                const items = oData.items.map(i => new OrderItem(i.productName, i.price, i.weight, i.quantity));
                
                const order = new Order(oData.id, client, oData.country, oData.address, items);
                order.setStatus(oData.status);

                let deliveryMethod: DeliveryMethodInterface;
                if (oData.deliveryType === "Express") deliveryMethod = new ExpressDelivery();
                else if (oData.deliveryType === "Pickup") deliveryMethod = new PickupDelivery();
                else deliveryMethod = new StandartDelivery();

                order.setDelivery(deliveryMethod);

                if (oData.courierName) {
                    const foundCourier = couriers.find(co => (co.name === oData.courierName && co.phone === oData.courierPhone));
                    if (foundCourier) {
                        order.setCourier(foundCourier);
                    }
                }

                return order;
            });

            return {
                clients,
                couriers,
                orders,
                orderIdCounter: data.orderIdCounter || (orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1)
            };
        } catch (error) {
            return {
                clients: [],
                couriers: [],
                orders: [],
                orderIdCounter: 1
            };
        }
    }
}