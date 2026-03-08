const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const cors = require('cors');

const SECRET_KEY = 'your-secret-key';
const expiresIn = '1h';

server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);

// Auth endpoint
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const users = router.db.get('users').value();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    const accessToken = jwt.sign({ ...userWithoutPassword }, SECRET_KEY, { expiresIn });
    res.json({ accessToken, user: userWithoutPassword });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Protect API routes
server.use((req, res, next) => {
  if (req.method === 'GET') {
    next();
    return;
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});