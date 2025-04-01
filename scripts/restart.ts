import { existsSync, unlinkSync } from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');


const restartFlagFile = path.join(rootDir, '.restart');

console.log('Checking for restart flag...');


if (existsSync(restartFlagFile)) {
    console.log('Restart flag found. Removing flag and restarting bot...');
    
    try {
        
        unlinkSync(restartFlagFile);
        
        
        const devProcess = exec('npm run dev', { cwd: rootDir });
        
        
        devProcess.stdout?.pipe(process.stdout);
        devProcess.stderr?.pipe(process.stderr);
        
        console.log('Bot restarting...');
    } catch (error) {
        console.error('Error during restart:', error);
    }
} else {
    console.log('No restart flag found. No action needed.');
} 