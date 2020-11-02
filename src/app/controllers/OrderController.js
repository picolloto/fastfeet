import * as Yup from 'yup';

import { parseISO, format, isWithinInterval } from 'date-fns';

import Order from '../models/Order';
import File from '../models/File';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
// import Delivery_problems from '../models/Delivery_problems';
import OrderDeliveryMail from '../jobs/OrderDeliveryMail';

import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const order = await Order.findAll({
      where: { deliveryman_id: req.params.id, canceled_at: null },
      order: ['created_at'],
      attributes: [
        'id',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'product',
        'start_date',
        'end_date',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Deliveryman,
          as: 'deliverymans',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipients',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!order) {
      return res.status(400).json({ error: 'Delivery man not found' });
    }

    return res.json(order);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    // Verifica se o Recipient existe
    if (recipient_id) {
      const recipientExist = await Recipient.findByPk(recipient_id);

      if (!recipientExist) {
        return res.status(401).json({ error: 'Recipient does not exists' });
      }
    }

    // Verifica se o Deliveryman existe
    if (deliveryman_id) {
      const deliverymanExist = await Deliveryman.findByPk(deliveryman_id);

      if (!deliverymanExist) {
        return res.status(401).json({ error: 'Recipient does not exists' });
      }
    }

    const createOrder = await Order.create({
      product,
      recipient_id,
      deliveryman_id,
      status: 'PENDENTE',
    });

    if (!createOrder) {
      return res
        .status(400)
        .json({ error: 'Sorry! Ocurred a problem...Try more later.' });
    }

    // Envia um e-mail informando a disponibilidade da encomenda
    // const { name, email } = await Deliveryman.findByPk(deliveryman_id);

    return res.json(createOrder);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().notRequired(),
      start_date: Yup.date().notRequired(),
      end_date: Yup.date().notRequired(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const orderVerify = await Order.findOne({ where: { id: req.params.id } });

    if (!orderVerify) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    const hourToday = new Date();
    const date = format(hourToday, 'yyyy-MM-dd');
    const startHour = parseISO(`${date}T08:00`);
    const endHour = parseISO(`${date}T18:00`);

    const { deliveryman_id } = orderVerify;
    const deliverymanDelivery = await Order.findAll({ where: deliveryman_id });

    const countDelivery = deliverymanDelivery.map((row) => {
      if (
        row.start_date &&
        isWithinInterval(row.start_date, { start: startHour, end: endHour })
      ) {
        return +1;
      }
      return 0;
    });

    if (req.body.start_date && countDelivery < 5) {
      if (!isWithinInterval(hourToday, { start: startHour, end: endHour })) {
        return res.status(401).json({
          error:
            'Você não pode retirar encomendas antes das 08:00 e depois das 18:00',
        });
      }
    } else {
      return res.status(500).json({
        error: 'Você já atingiu o limite de entregas hoje, volte amanhã!',
      });
    }

    const order = await orderVerify.update(req.body);

    return res.json(order);
  }

  async delete(req, res) {
    const orderDelete = await Order.findOne({
      where: { id: req.params.id, canceled_at: null },
    });

    // let { description } = await Delivery_problems.findOne({
    //   where: { delivery_id: req.params.id },
    // });

    // if (description === null) {
    const description = 'Sentimos muito, mas a entrega teve que ser cancelada!';
    // }

    if (!orderDelete) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    const order = await orderDelete.update({ canceled_at: new Date() });

    if (!order) {
      return res
        .status(400)
        .json({ error: 'Sorry! Ocurred a problem...Try more later.' });
    }

    // Envia um e-mail informando o cancelamento da entrega
    const { deliveryman_id, product } = orderDelete;
    const { name, email } = await Deliveryman.findByPk(deliveryman_id);

    const emailSend = await Queue.add(OrderDeliveryMail.key, {
      name,
      email,
      product,
      description,
      date: new Date(),
    });

    return res.json(emailSend);
  }
}

export default new OrderController();
