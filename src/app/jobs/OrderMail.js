import Mail from '../../lib/Mail';

class OrderMail {
    get key() {
        return 'OrderMail';
    }

    async handle({ data }) {
        const { deliverymanOrder } = data;

        await Mail.sendMail({
            to: `${deliverymanOrder.name} <${deliverymanOrder.email}>`,
            subject: 'Nova Entrega',
            template: 'delivery',
            context: {
                name: deliverymanOrder.name,
            },
        });
    }
}

export default new OrderMail();
