export class OrderItem {
    constructor (
        public readonly productName: string,
        public readonly price: number,
        public readonly quantity: number
    ) {}

    public getTotalPrice(): number {
        return this.price * this.quantity;
    }
}
