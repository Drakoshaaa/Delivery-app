import { Person } from "./Person" 

export class Courier extends Person {
    private isBusy: boolean = false;

    constructor (name: string, phone: string) {
        super(name, phone);
    }

    public getIsBusy(): boolean {
        return this.isBusy;
    }

    public setIsBusy(busy: boolean): void {
        this.isBusy = busy;
    }
}
