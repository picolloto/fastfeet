import * as Yup from 'yup';

import Delivery_problems from '../models/Delivery_problems';
import Order from '../models/Order';

class ProblemsController {
  async listProblem(req, res) {
    const problems = await Delivery_problems.findAll({
      include: [
        {
          model: Order,
          as: 'orders',
        },
      ],
    });

    return res.json(problems);
  }

  async index(req, res) {
    const { delivery_id } = req.body;

    const orderWithProblem = await Delivery_problems.findAll(delivery_id);

    if (!orderWithProblem) {
      return res.status(401).json({ error: 'Order not exists!' });
    }

    return res.json(orderWithProblem);
  }

  async store(req, res) {
    const { delivery_id } = req.params;
    const { description } = req.body;
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)) && delivery_id) {
      return res
        .status(400)
        .json({ error: "Validate fails, 'description' is required! " });
    }

    const createProblem = await Delivery_problems.create({
      delivery_id,
      description,
    });

    return res.json(createProblem);
  }
}

export default new ProblemsController();
