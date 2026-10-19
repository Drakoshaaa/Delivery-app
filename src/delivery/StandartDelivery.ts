import { DeliveryMethodInterface } from "./DeliveryMethodInterface";
import { CountryList } from "../models/CountryList";

export class StandartDelivery implements DeliveryMethodInterface {
    public calculateCost(country: CountryList, weight: number): number {
        const deliveryFee: number = 0.8;
        const baseCost: number = 3;
        
        let countryCost: number = 0;
        if (country == CountryList.RUS) countryCost = 2;
        else if (country == CountryList.KAZ) countryCost = 10;
        else if (country == CountryList.BLR) countryCost = 15;

        const weightCost: number = deliveryFee * (Math.trunc(weight / 1000));

        return baseCost + countryCost + weightCost;
    }

    public calculateDays(country: CountryList): number {
        if (country == CountryList.RUS) return 3;
        else if (country == CountryList.KAZ) return 7;
        else if (country == CountryList.BLR) return 10;
        else return 0;
    }

    public requiresCourier(): boolean {
        return true;
    }
}