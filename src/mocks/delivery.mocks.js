
import { faker } from "@faker-js/faker";
import {
    DELIVERY_STATUS,
    DELIVERY_PRIORITY
} from "../constants/index.js";


export const generateMockDelivery = (order, driver = null) => {

    const status = faker.helpers.arrayElement([
        DELIVERY_STATUS.PENDING,
        DELIVERY_STATUS.ASSIGNED,
        DELIVERY_STATUS.IN_TRANSIT,
        DELIVERY_STATUS.DELIVERED
    ]);

    const delivery = {
        order: order._id || order.id,

        driver: driver
            ? (driver._id || driver.id)
            : null,

        status,

        priority: faker.helpers.arrayElement([
            DELIVERY_PRIORITY.LOW,
            DELIVERY_PRIORITY.NORMAL,
            DELIVERY_PRIORITY.HIGH
        ]),

        assignedAt: status !== DELIVERY_STATUS.PENDING
            ? faker.date.recent()
            : null,

        deliveredAt: status === DELIVERY_STATUS.DELIVERED
            ? faker.date.recent()
            : null
    };

    return delivery;
};


export const generateMockDeliveries = (orders, drivers = [], qty) => {

    const deliveriesData = [];

    for (let i = 0; i < qty; i++) {

        const order = faker.helpers.arrayElement(orders);

        const driver = drivers.length > 0
            ? faker.helpers.arrayElement(drivers)
            : null;

        deliveriesData.push(
            generateMockDelivery(order, driver)
        );
    }

    return deliveriesData;
};

