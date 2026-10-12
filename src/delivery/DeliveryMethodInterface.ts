export interface DeliveryMethodInterface {
    calculateCost(orderSum: number): number;
    calculateDays(orderSum: number): number;
    requiresCourier(): boolean;
}