import { faker } from "@faker-js/faker";
import { ORDER_STATUS, ORDER_PRIORITY } from "../constants/index.js";


export const generateMockOrder = (user) => {

    const itemPrice = faker.number.float({
        min: 1000,
        max: 50000,
        fractionDigits: 2
    });

    const quantity = faker.number.int({
        min: 1,
        max: 5
    });

    const shippingCost = faker.number.float({
        min: 500,
        max: 5000,
        fractionDigits: 2
    });

    const total = itemPrice * quantity + shippingCost;

    const order = {
        customer: user._id || user.id,

        items: [
            {
                name: faker.commerce.productName(),
                quantity,
                price: itemPrice
            }
        ],

        deliveryAddress: faker.location.streetAddress(),

        total,

        shippingCost,

        declaredValue: itemPrice * quantity,

        status: faker.helpers.arrayElement([
            ORDER_STATUS.CREATED,
            ORDER_STATUS.ASSIGNED,
            ORDER_STATUS.PICKED_UP,
            ORDER_STATUS.IN_TRANSIT,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.CANCELLED
        ]),

        priority: faker.helpers.arrayElement([
            ORDER_PRIORITY.LOW,
            ORDER_PRIORITY.NORMAL,
            ORDER_PRIORITY.HIGH
        ]),

        delivery: null
    };

    return order;
};


export const generateMockOrders = (users, qty) => {

    const ordersData = [];

    for (let i = 0; i < qty; i++) {

        const user = faker.helpers.arrayElement(users);

        ordersData.push(
            generateMockOrder(user)
        );
    }

    return ordersData;
};

