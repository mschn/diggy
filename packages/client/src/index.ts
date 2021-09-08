// used by tsyringe for dependency injection
import 'reflect-metadata';
import { Client } from './client';

// required by webpack to have the style in index.ejs
import './style.css';
import { container } from 'tsyringe';

document.body.onload = () => {
  const client = container.resolve(Client);
  client.start();
};
