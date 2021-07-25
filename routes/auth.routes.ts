/* eslint-disable consistent-return */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import express from 'express';

const { Router } = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = Router();

// /api/auth/register
router.post('/register', async (req: express.Request, res: express.Response) => {
  try {
    const { login, password } = req.body;

    const candidate = await User.findOne({ login });

    if (candidate) {
      return res.status(400).json({ message: 'User with this login already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ login, password: hashedPassword });

    await user.save();

    res.status(201).json({ message: 'User succesfully created' });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong, try again later' });
  }
});

// /api/auth/login
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ login });

    if (!user) {
      return res.status(400).json({ message: 'User was not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'incorrect password, try again' });
    }

    const token = jwt.sign(
      { userId: user.id },
      config.get('jwtSecret'),
      { expiresIn: '1h' },
    );

    res.json({ token, userId: user.id });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong, try again later' });
  }
});

module.exports = router;
