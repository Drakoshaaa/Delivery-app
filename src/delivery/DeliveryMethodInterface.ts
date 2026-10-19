import { CountryList } from "../models/CountryList";

export interface DeliveryMethodInterface {
    calculateCost(country: CountryList, weight: number): number;
    calculateDays(country: CountryList, weight: number): number;
    requiresCourier(): boolean;
}