import { DeliveryMethodInterface } from "./DeliveryMethodInterface";
import { CountryList } from "../models/CountryList";

export class ExpressDelivery implements DeliveryMethodInterface {
    public calculateCost(country: CountryList, weight: number): number {
        const deliveryFee: number = 2.5;
        const baseCost: number = 5;
        
        let countryCost: number = 0;
        if (country == CountryList.RUS) countryCost = 10;
        else if (country == CountryList.KAZ) countryCost = 20;
        else if (country == CountryList.BLR) countryCost = 30;

        const weightCost: number = deliveryFee * (Math.trunc(weight / 1000));

        return baseCost + countryCost + weightCost;
    }

    public calculateDays(country: CountryList): number {
        if (country == CountryList.RUS) return 1;
        else if (country == CountryList.KAZ) return 3;
        else if (country == CountryList.BLR) return 5;
        else return 0;
    }

    public requiresCourier(): boolean {
        return true;
    }
}