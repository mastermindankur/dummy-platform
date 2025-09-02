import { config } from 'dotenv';
config();

import '@/ai/flows/generate-executive-summary.ts';
import '@/ai/flows/root-cause-analysis.ts';
import '@/ai/flows/action-recommendations.ts';
import '@/ai/flows/process-excel-file.ts';
