import { DeliveryMethodInterface } from "./DeliveryMethodInterface";

export class StandartDelivery implements DeliveryMethodInterface {
    public calculateCost(orderSum: number): number {
        return orderSum >= 500 ? 5 : 10 /* Скидка на доставку от 500$ (5$ доставка), иначе без скидки (10$ доставка) */
    }

    public calculateDays(orderSum: number): number {
        return orderSum >= 1000 ? 5 : 3 /* Если заказ больше 1000$, то доставка будет дольше (5 дней), иначе быстрее (3 дня)*/
    }

    public requiresCourier(): boolean {
        return true;
    }
}