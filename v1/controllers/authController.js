const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  console.log('hello');
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.create({ name, email, password, role });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ user: { ...user.toJSON() }, token });
  } catch (err) {
    console.log('xxx', err);
    console.error(err);
    res.status(400).json({ message: 'Error registering user' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ user: { ...user.toJSON() }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
