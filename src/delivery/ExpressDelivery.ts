import { DeliveryMethodInterface } from "./DeliveryMethodInterface";

export class ExpressDelivery implements DeliveryMethodInterface {
    public calculateCost(orderSum: number): number {
        return orderSum >= 500 ? 15 : 25 /* Скидка на доставку от 500$ (15$ доставка), иначе без скидки (25$ доставка) */
    }

    public calculateDays(): number {
        return 1 /* В любом случае экспресс-доставка будет длиться 1 день */
    }

    public requiresCourier(): boolean {
        return true;
    }
}