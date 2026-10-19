import { Person } from "./Person"

export class Client extends Person {
    constructor(name: string, phone: string) {
        super(name, phone);
    }
}
