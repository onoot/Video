// controllers/auth.controller.js
const { generateToken } = require('../utils/jwt');
const { User } = require('../models');

const login = async (req, res) => {
  try {
    const { email, password, remember = false } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    }, remember);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    res.json({ 
      user: { 
        id: user.id, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(204).send();
};

const checkAuth = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'role']
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ message: 'Authentication check failed' });
  }
};

const change_login = async (req, res) => {
  try {
    const { old, login, pass } = req.body;
    
    if(old === login) {
      return res.status(400).json({ message: 'New login must be different from old login' });
    }

    const user = await User.findOne({ where: { email: old } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await user.validatePassword(pass);
    
    if(!isValidPassword) {
      return res.status(402).json({ 
        success: false,
        message: 'Invalid password' 
      });
    }

    user.email = login;
    await user.save();

    return res.json({ 
      success: true,
      message: 'Login changed successfully'
    });
  } catch (error) {
    console.error('Change login error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ message: 'Change login failed' });
  }
};

const change_password = async (req, res) => {
  try {
    const { login, old, pass, confirm_pass } = req.body;
    
    if(pass !== confirm_pass) {
      return res.status(400).json({ 
        success: false,
        message: 'Passwords do not match' 
      });
    }

    const user = await User.findOne({ where: { email: login } });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const isValidPassword = await user.validatePassword(old);
    
    if(!isValidPassword) {
      return res.status(402).json({ 
        success: false,
        message: 'Invalid current password' 
      });
    }

    user.password = pass;
    await user.save();

    return res.json({ 
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Change password failed' 
    });
  }
};

module.exports = { change_password, change_login, login, logout, checkAuth };