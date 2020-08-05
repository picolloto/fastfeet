import * as Yup from 'yup';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const recipients = await Recipient.findAll();

    return res.json(recipients);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string().notRequired(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      postal_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.create(req.body);

    return res.json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string().notRequired(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      postal_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(400).json({ error: 'Destinatary already exist' });
    }

    const destinatary = await recipient.update(req.body);

    return res.json(destinatary);
  }

  async delete(req, res) {
    if (!(await Recipient.findByPk(req.params.id))) {
      return res.status(400).json({ error: 'Destinatary already exists' });
    }

    const recipient = await Recipient.destroy({
      where: { id: req.params.id },
    });

    return res.status(200).json(recipient);
  }
}

export default new RecipientController();
