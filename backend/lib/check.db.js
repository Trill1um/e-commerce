import net from 'net';

// Check if MySQL port is available
async function isMySQLRunning(host = 'localhost', port = 3306) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        
        socket.setTimeout(2000);
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
        
        socket.connect(port, host);
    });
}

// Check MySQL with retry (Docker-friendly, production-optimized)
export async function ensureMySQLRunning(maxAttempts = 30) {
    // Skip check in production - Railway/Render MySQL is always ready
    if (process.env.NODE_ENV === 'production') {
        console.log('✓ Production mode - skipping MySQL port check');
        return { success: true, port: null };
    }
    
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '3306');
    
    console.log(`Attempting to connect to MySQL at ${host}:${port}...`);
    
    for (let i = 0; i < maxAttempts; i++) {
        const isRunning = await isMySQLRunning(host, port);
        
        if (isRunning) {
            console.log(`✓ MySQL is running at ${host}:${port}!`);
            return { success: true, port };
        }
        
        console.log(`Waiting for MySQL... (${i + 1}/${maxAttempts})`);
        await new Promise(r => setTimeout(r, 2000));
    }
    
    console.error(`❌ Could not connect to MySQL at ${host}:${port} after ${maxAttempts} attempts`);
    console.error('Please check:');
    console.error('- Is the MySQL container running? (docker ps)');
    console.error('- Are environment variables correct in docker-compose.yml?');
    console.error('- Is port 3306 available on the host?');
    
    return { success: false, port: null };
}