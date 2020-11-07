import * as Yup from 'yup';
import { Op } from 'sequelize';

import { isWithinInterval, parseISO, format } from 'date-fns';
import Order from '../models/Order';

class DeliveriesController {
    async index(req, res) {
        const { filter } = req.query;

        if (!filter) {
            const deliveries = await Order.findAll({
                where: {
                    deliveryman_id: req.params.id,
                },
                order: ['id'],
            });

            return res.json(deliveries);
        }

        if (filter === 'canceled') {
            const deliveries = await Order.findAll({
                where: {
                    deliveryman_id: req.params.id,
                    canceled_at: { [Op.ne]: { canceled_at: null } },
                },
                order: ['id'],
            });

            return res.json(deliveries);
        }

        if (filter === 'delivered') {
            const deliveries = await Order.findAll({
                where: {
                    deliveryman_id: req.params.id,
                    end_date: { [Op.ne]: null },
                },
                order: ['id'],
            });

            return res.json(deliveries);
        }

        if (filter === 'started') {
            const deliveries = await Order.findAll({
                where: {
                    deliveryman_id: req.params.id,
                    start_date: { [Op.ne]: null },
                    canceled_at: null,
                    end_date: null,
                },
                order: ['id'],
            });

            return res.json(deliveries);
        }

        return this;
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            start_date: Yup.date(),
            end_date: Yup.date(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        if (req.body.start_date) {
            const date = format(new Date(), 'yyyy-MM-dd');

            if (
                !isWithinInterval(new Date(), {
                    start: parseISO(`${date}T08:00`),
                    end: parseISO(`${date}T18:00`),
                })
            ) {
                return res.status(401).json({
                    error:
                        'Você não pode retirar encomendas antes das 08:00 e depois das 18:00',
                });
            }
        }

        const { deliveryman_id, order_id } = req.params;

        const orderUpdate = await Order.update(req.body, {
            where: { id: order_id, deliveryman_id },
        });

        return res.json(orderUpdate);
    }
}

export default new DeliveriesController();
