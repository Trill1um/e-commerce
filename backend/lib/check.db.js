import net from 'net';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Check if MySQL port is available
async function isMySQLRunning(port = 3306) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        
        socket.setTimeout(1000);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        
        socket.on('error', () => {
            resolve(false);
        });
        
        socket.connect(port, 'localhost');
    });
}

// Prompt user to start MySQL
async function promptForMySQL() {
    console.log('\n⚠️  MySQL is not running!');
    console.log('\nPlease start XAMPP:');
    console.log('1. Open XAMPP Control Panel');
    console.log('2. Click "Start" next to MySQL');
    console.log('3. Wait for it to turn green\n');
    
    return new Promise((resolve) => {
        rl.question('Press Enter when MySQL is running...', () => {
            rl.close();
            resolve();
        });
    });
}

// Check MySQL with retry
export async function ensureMySQLRunning(maxAttempts = 3) {
    for (let i = 0; i < maxAttempts; i++) {
        const isRunning = await isMySQLRunning();
        
        if (isRunning) {
            return true;
        }
        
        if (i === 0) {
            await promptForMySQL();
        } else {
            console.log(`Checking again... (Attempt ${i + 1}/${maxAttempts})`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    
    return false;
}