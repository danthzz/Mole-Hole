const router = require('express').Router();
const Pin = require('../models/Pin')

// Criar Marcador

router.post('/', async (req, res) => {
  const newPin = new Pin(req.body);
  try {
    const savedPin = await newPin.save();
    res.status(200).json(savedPin);
  } catch (err) {
    res.status(500).json(err)
  }
});

// chamar

router.get('/', async (req, res) => {
  try {
    const pins = await Pin.find();
    res.status(200).json(pins);
  } catch (err) {
    res.status(500).json(err)
  }
});

// ATUALIZAR

router.put('/:id', async (req, res) => {
  try {
    const updatedPin = await Pin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedPin) {
      res.status(404).json({ message: 'Pin não encontrado' });
      return;
    }
    res.status(200).json(updatedPin);
  } catch (err) {
    res.status(500).json(err);
  }
});


//DELETAR

router.delete('/:id', async (req, res) => {
  try {
    const deletedPin = await Pin.findByIdAndDelete(req.params.id);
    if (!deletedPin) {
      res.status(404).json({ message: 'Pin não encontrado' });
      return;
    }
    res.status(200).json({ message: 'Pin excluído com sucesso' });
  } catch (err) {
    res.status(500).json(err);
  }
});




module.exports = router