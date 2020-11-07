import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
    async index(req, res) {
        const deliverymans = await Deliveryman.findAll();

        if (!deliverymans) {
            return res.status(401).json({ error: 'Deliveryman not found' });
        }

        return res.json(deliverymans);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const emailExists = await Deliveryman.findOne({
            where: { email: req.body.email },
        });

        if (emailExists) {
            return res.status(401).json({ error: 'E-mail already use' });
        }

        const deliveryman = await Deliveryman.create(req.body);

        return res.json(deliveryman);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const deliverymanUpdate = await Deliveryman.findByPk(req.params.id);

        if (!deliverymanUpdate) {
            return res.status(401).json({ error: 'Deliveryman not found' });
        }

        const emailExists = await Deliveryman.findOne({
            where: { email: req.body.email },
        });

        if (emailExists) {
            return res.status(401).json({ error: 'E-mail already use' });
        }

        const deliveryman = await deliverymanUpdate.update(req.body);

        return res.json(deliveryman);
    }

    async delete(req, res) {
        const deliverymanDelete = await Deliveryman.findByPk(req.params.id);

        if (!deliverymanDelete) {
            return res.status(400).json({ error: 'User does not exists' });
        }

        if (await deliverymanDelete.destroy()) {
            return res
                .status(200)
                .json({ error: 'Delivery man successfully deletes' });
        }

        return res.status(500).json({ error: 'Delivery deletion error' });
    }
}

export default new DeliverymanController();
