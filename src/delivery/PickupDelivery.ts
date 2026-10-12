import { DeliveryMethodInterface } from "./DeliveryMethodInterface";

export class PickupDelivery implements DeliveryMethodInterface {
    public calculateCost(): number {
        return 0; /* Самовывоз бесплатно */
    }

    public calculateDays(): number {
        return 0; 
    }

    public requiresCourier(): boolean {
        return false;
    }
}