// server.mjs
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { runIntegrationTestForQuery } from '../../../API/apiIntegration.mjs';

const app = express();
const port = process.env.PORT || 3000;
//fix