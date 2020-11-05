import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class OrderDeliveryMail {
    get key() {
        return 'OrderDeliveryMail';
    }

    async handle({ data }) {
        const { name, email, product, description, date } = data;

        await Mail.sendMail({
            to: `${name} <${email}>`,
            subject: 'Entrega cancelada',
            template: 'cancellation',
            context: {
                name,
                product,
                description,
                date: format(
                    parseISO(date),
                    "'dia' dd 'de' MMMM', às' H:mm'h",
                    {
                        locale: pt,
                    }
                ),
            },
        });
    }
}

export default new OrderDeliveryMail();
