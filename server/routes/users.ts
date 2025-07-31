import { Router } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { UserData } from '../types/user';

const router = Router();

router.get('/', (req, res) => {
  const dataPath = path.join(__dirname, '../data/usersMock.json');
  const user: UserData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  res.json(user);
});

export default router;
