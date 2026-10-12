import { Client } from "./Client";
import { Courier } from "./Courier";
import { OrderItem } from "./OrderItem";
import { OrderStatus } from "./OrderStatus";
import { DeliveryMethodInterface } from "../delivery/DeliveryMethodInterface"

export class Order {
    private status: OrderStatus = OrderStatus.CREATED;
    private delivery?: DeliveryMethodInterface;
    private courier?: Courier;

    constructor (
        public readonly id: number,
        public readonly client: Client,
        public readonly address: string,
        public readonly items: OrderItem[]
    ) {}

    public getStatus(): OrderStatus {
        return this.status;
    }

    public getDelivery(): DeliveryMethodInterface | undefined {
        return this.delivery;
    }

    public getCourier(): Courier | undefined {
        return this.courier;
    }

    public setStatus(newStatus: OrderStatus): void {
        this.status = newStatus;
    }

    public setDelivery(newDelivery: DeliveryMethodInterface): void {
        this.delivery = newDelivery;
    }

    public setCourier(newCourier: Courier): void {
        this.courier = newCourier;
    }
}
