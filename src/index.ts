import { Order } from "./models/Order";
import { OrderItem } from "./models/OrderItem";
import { Client } from "./models/Client";

const firstOrderItem = new OrderItem("Дилдо", 15, 2);
const firstClient = new Client("Семён");
const firstOrder = new Order(1, firstClient, "ул. Пушкина 67", [firstOrderItem]);

console.log(`Всё ОК!`)
console.log(firstOrder.items[0].getTotalPrice() + "$")