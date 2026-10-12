export class Courier {
    private isBusy: boolean = false;

    constructor (
        public readonly name: string
    ) {}

    public getIsBusy(): boolean {
        return this.isBusy;
    }

    public setIsBusy(busy: boolean): void {
        this.isBusy = busy;
    }
}
