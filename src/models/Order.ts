import { Client } from "./Client";
import { Courier } from "./Courier";
import { OrderItem } from "./OrderItem";
import { OrderStatus } from "./OrderStatus";
import { CountryList } from "./CountryList";
import { DeliveryMethodInterface } from "../delivery/DeliveryMethodInterface"

export class Order {
    private status: OrderStatus = OrderStatus.CREATED;
    private delivery?: DeliveryMethodInterface;
    private courier?: Courier;

    constructor (
        public readonly id: number,
        public readonly client: Client,
        public readonly country: CountryList,
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

    public getItemsCost(): number {
        return this.items.reduce((sum, item) => sum + item.getTotalPrice(), 0)
    }

    public getItemsWeight(): number {
        return this.items.reduce((sum, item) => sum + item.getTotalWeight(), 0)
    }
}
